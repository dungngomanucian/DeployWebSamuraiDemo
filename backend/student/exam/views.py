"""
API Views for Exam functionality
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import ExamService
from .serializers import (
    LevelSerializer, 
    ExamSerializer, 
    FullExamDataSerializer,
    ExamResultSerializer,
    StudentAnswerSerializer
)


@api_view(['GET'])
def get_levels(request):
    """Get all JLPT levels"""
    result = ExamService.get_levels()
    
    if result['success']:
        serializer = LevelSerializer(result['data'], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_exam_by_id(request, exam_id):
    """Get exam details by ID"""
    result = ExamService.get_exam_by_id(exam_id)
    
    if result['success']:
        serializer = ExamSerializer(result['data'])
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_exams_by_level(request, level_id):
    """Get all exams for a specific level"""
    result = ExamService.get_exams_by_level(level_id)
    
    if result['success']:
        serializer = ExamSerializer(result['data'], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_full_exam_data(request, exam_id):
    """Get complete exam data including all questions and answers"""
    result = ExamService.get_full_exam_data(exam_id)
    
    if result['success']:
        # Return raw data without serialization to preserve nested structure
        return Response(result['data'], status=status.HTTP_200_OK)
    return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def save_exam_result(request):
    """Save exam result"""
    serializer = ExamResultSerializer(data=request.data)
    if serializer.is_valid():
        result = ExamService.save_exam_result(serializer.validated_data)
        if result['success']:
            return Response(result['data'], status=status.HTTP_201_CREATED)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def save_student_answers(request):
    """Save student answers"""
    answers = request.data.get('answers', [])
    serializer = StudentAnswerSerializer(data=answers, many=True)
    if serializer.is_valid():
        result = ExamService.save_student_answers(serializer.validated_data)
        if result['success']:
            return Response(result['data'], status=status.HTTP_201_CREATED)
        return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
