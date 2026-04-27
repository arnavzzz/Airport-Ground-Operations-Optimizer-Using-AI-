import ast
import contextlib
import io
import json
from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
NOTEBOOKS_DIR = BASE_DIR / "ai_models" / "notebooks"


class NotebookExecutionError(RuntimeError):
    """Raised when a notebook cannot be converted into an API payload."""


def _skip_top_level_expression(node):
    if not isinstance(node, ast.Expr):
        return False

    value = node.value
    if isinstance(value, ast.Call):
        func = value.func
        if isinstance(func, ast.Name) and func.id in {"display", "print"}:
            return True
        if isinstance(func, ast.Attribute) and func.attr in {"show", "head", "keys"}:
            return True
        return False
    return True


def _prepare_source(source):
    filtered_lines = []
    for line in source.splitlines():
        stripped = line.strip()
        if stripped.startswith("%") or stripped.startswith("!"):
            continue
        filtered_lines.append(line)
    return "\n".join(filtered_lines)


def _compile_cell(source, notebook_name, cell_index):
    prepared = _prepare_source(source)
    if not prepared.strip():
        return None

    try:
        module = ast.parse(prepared, filename=f"{notebook_name}#cell{cell_index}")
    except SyntaxError as exc:
        raise NotebookExecutionError(
            f"Failed to parse {notebook_name} cell {cell_index}: {exc.msg}"
        ) from exc

    module.body = [node for node in module.body if not _skip_top_level_expression(node)]
    ast.fix_missing_locations(module)

    if not module.body:
        return None
    return compile(module, filename=f"{notebook_name}#cell{cell_index}", mode="exec")


def _json_safe(value):
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, tuple):
        return [_json_safe(item) for item in value]
    if isinstance(value, pd.DataFrame):
        return _json_safe(value.to_dict(orient="records"))
    if isinstance(value, pd.Series):
        return _json_safe(value.to_dict())
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if isinstance(value, np.generic):
        return value.item()
    if pd.isna(value):
        return None
    return value


@lru_cache(maxsize=32)
def execute_notebook_payload(notebook_filename):
    notebook_path = NOTEBOOKS_DIR / notebook_filename
    if not notebook_path.exists():
        raise NotebookExecutionError(f"Notebook not found: {notebook_filename}")

    notebook = json.loads(notebook_path.read_text(encoding="utf-8"))
    namespace = {"__name__": "__notebook_runtime__"}

    for cell_index, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") != "code":
            continue
        code = _compile_cell("".join(cell.get("source", [])), notebook_filename, cell_index)
        if code is None:
            continue
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(code, namespace, namespace)
        except Exception as exc:  # noqa: BLE001
            raise NotebookExecutionError(
                f"Execution failed in {notebook_filename} cell {cell_index}: {exc}"
            ) from exc

    if "payload" not in namespace:
        raise NotebookExecutionError(f"{notebook_filename} did not define a payload variable")

    return _json_safe(namespace["payload"])


def clear_notebook_cache():
    execute_notebook_payload.cache_clear()
