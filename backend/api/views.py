from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def test_connection(request):
    return Response({
        'status': 'connected',
        'message': 'Django is talking to React!',
    })


@api_view(['POST'])
def predict(request):
    payload = request.data or {}
    return Response({
        'status': 'ok',
        'message': 'Prediction endpoint is ready.',
        'received': payload,
        'prediction': {
            'delay_risk': 'low',
            'confidence': 0.87,
        },
    })
