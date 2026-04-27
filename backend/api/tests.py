from django.test import TestCase


MODULE_ENDPOINTS = [
    "/api/command-center/",
    "/api/flight-operations/",
    "/api/human-resources/",
    "/api/equipments/",
    "/api/infrastructure/",
    "/api/ai-engine/",
    "/api/analytics/",
    "/api/weather/",
    "/api/notifications/",
]

ROOT_ENDPOINTS = [
    "/command-center/",
    "/flight-operations/",
    "/human-resources/",
    "/equipments/",
    "/infrastructure/",
    "/ai-engine/",
    "/analytics/",
    "/weather/",
    "/notifications/",
]


class NotebookApiSmokeTests(TestCase):
    def test_all_module_endpoints_respond(self):
        for endpoint in MODULE_ENDPOINTS:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 200, response.json())
                body = response.json()
                self.assertEqual(body["status"], "ok")
                self.assertIn("data", body)

    def test_root_alias_endpoints_respond(self):
        for endpoint in ROOT_ENDPOINTS:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 200, response.json())
                body = response.json()
                self.assertEqual(body["status"], "ok")
                self.assertIn("data", body)

# Create your tests here.
