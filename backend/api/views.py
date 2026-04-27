from rest_framework.decorators import api_view
from rest_framework.response import Response


LIVE_FLIGHTS = [
    {
        'id': 'FL-1001',
        'flightId': 'AI302',
        'airline': 'Air India',
        'status': 'On Time',
        'gate': 'G14',
        'assignedGate': 'G14',
        'scheduledTime': '09:20',
        'actualTime': '09:22',
        'scheduledDep': '10:35',
        'actualDep': '10:37',
        'runway': 'RWY 09L',
        'bay': 'Bay A1',
        'turnaround': 58,
        'turnaroundScore': 91,
        'isArrival': True,
        'delay': 2,
    },
    {
        'id': 'FL-1002',
        'flightId': '6E817',
        'airline': 'IndiGo',
        'status': 'Boarding',
        'gate': 'G08',
        'assignedGate': 'G08',
        'scheduledTime': '09:45',
        'actualTime': '09:45',
        'scheduledDep': '10:50',
        'actualDep': '10:55',
        'runway': 'RWY 27R',
        'bay': 'Bay B2',
        'turnaround': 44,
        'turnaroundScore': 84,
        'isArrival': False,
        'delay': 5,
    },
    {
        'id': 'FL-1003',
        'flightId': 'SG491',
        'airline': 'SpiceJet',
        'status': 'Delayed',
        'gate': 'G21',
        'assignedGate': 'G19',
        'scheduledTime': '10:05',
        'actualTime': '10:38',
        'scheduledDep': '11:15',
        'actualDep': '11:49',
        'runway': 'RWY 09R',
        'bay': 'Bay C1',
        'turnaround': 73,
        'turnaroundScore': 62,
        'isArrival': True,
        'delay': 33,
    },
    {
        'id': 'FL-1004',
        'flightId': 'UK775',
        'airline': 'Vistara',
        'status': 'Departed',
        'gate': 'G03',
        'assignedGate': 'G03',
        'scheduledTime': '08:30',
        'actualTime': '08:31',
        'scheduledDep': '09:40',
        'actualDep': '09:42',
        'runway': 'RWY 27L',
        'bay': 'Bay D1',
        'turnaround': 51,
        'turnaroundScore': 88,
        'isArrival': False,
        'delay': 2,
    },
    {
        'id': 'FL-1005',
        'flightId': 'I5298',
        'airline': 'AirAsia',
        'status': 'Arrived',
        'gate': 'G11',
        'assignedGate': 'G11',
        'scheduledTime': '08:55',
        'actualTime': '08:58',
        'scheduledDep': '10:10',
        'actualDep': '10:14',
        'runway': 'RWY 09L',
        'bay': 'Bay A3',
        'turnaround': 47,
        'turnaroundScore': 79,
        'isArrival': True,
        'delay': 3,
    },
]


@api_view(['GET'])
def test_connection(request):
    return Response({
        'status': 'connected',
        'message': 'Django is talking to React!',
    })


@api_view(['GET'])
def live_flights(request):
    return Response({
        'status': 'ok',
        'flights': LIVE_FLIGHTS,
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
