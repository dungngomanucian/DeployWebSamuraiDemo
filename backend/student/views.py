"""
API Views for Student App
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import ExamService


@api_view(['GET'])
def get_levels(request):
    """Get all JLPT levels"""
    result = ExamService.get_levels()
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_exam_by_id(request, exam_id):
    """Get exam details by ID"""
    result = ExamService.get_exam_by_id(exam_id)
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_exams_by_level(request, level_id):
    """Get all exams for a specific level"""
    result = ExamService.get_exams_by_level(level_id)
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_full_exam_data(request, exam_id):
    """Get complete exam data including all questions and answers"""
    result = ExamService.get_full_exam_data(exam_id)
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def save_exam_result(request):
    """Save exam result"""
    result_data = request.data
    result = ExamService.save_exam_result(result_data)
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_201_CREATED)
    return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def save_student_answers(request):
    """Save student answers"""
    answers = request.data.get('answers', [])
    result = ExamService.save_student_answers(answers)
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_201_CREATED)
    return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)

