"""
Utility functions for Exam functionality
"""
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


def format_exam_data(exam_data: Dict) -> Dict:
    """
    Format exam data for consistent response
    """
    try:
        return {
            'id': exam_data.get('id'),
            'title': exam_data.get('title'),
            'description': exam_data.get('description'),
            'total_duration': exam_data.get('total_duration'),
            'request_score': exam_data.get('request_score'),
            'type': exam_data.get('type'),
            'level': exam_data.get('level', {}),
            'created_at': exam_data.get('created_at'),
            'updated_at': exam_data.get('updated_at')
        }
    except Exception as e:
        logger.error(f"Error formatting exam data: {str(e)}")
        return exam_data


def validate_exam_access(student_id: str, exam_id: str) -> bool:
    """
    Validate if student can access the exam
    """
    # TODO: Implement access validation logic
    # For now, allow all access
    return True


def calculate_exam_score(answers: List[Dict], correct_answers: List[Dict]) -> Dict:
    """
    Calculate exam score based on student answers
    """
    try:
        total_questions = len(correct_answers)
        correct_count = 0
        
        for answer in answers:
            question_id = answer.get('question_id')
            answer_id = answer.get('answer_id')
            
            # Find correct answer for this question
            correct_answer = next(
                (ca for ca in correct_answers if ca.get('question_id') == question_id), 
                None
            )
            
            if correct_answer and correct_answer.get('id') == answer_id:
                correct_count += 1
        
        score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        return {
            'total_questions': total_questions,
            'correct_answers': correct_count,
            'score': round(score, 2),
            'passed': score >= 60  # Assuming 60% is passing
        }
    except Exception as e:
        logger.error(f"Error calculating exam score: {str(e)}")
        return {
            'total_questions': 0,
            'correct_answers': 0,
            'score': 0,
            'passed': False
        }
