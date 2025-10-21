"""
Serializers for Exam functionality
"""
from rest_framework import serializers


class LevelSerializer(serializers.Serializer):
    """Serializer for JLPT levels"""
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(allow_null=True)


class ExamSerializer(serializers.Serializer):
    """Serializer for exam details"""
    id = serializers.CharField()
    level_id = serializers.CharField()
    title = serializers.CharField(required=False, allow_null=True)
    total_duration = serializers.IntegerField(required=False, allow_null=True)
    request_score = serializers.IntegerField(required=False, allow_null=True)
    type = serializers.CharField(required=False, allow_null=True)
    version = serializers.CharField(required=False, allow_null=True)
    level = LevelSerializer(required=False)


class QuestionGuideSerializer(serializers.Serializer):
    """Serializer for question guides"""
    id = serializers.CharField()
    name = serializers.CharField(required=False, allow_null=True)


class QuestionTypeSerializer(serializers.Serializer):
    """Serializer for question types"""
    id = serializers.CharField()
    exam_section_id = serializers.CharField()
    question_guides_id = serializers.CharField()
    task_instructions = serializers.CharField(required=False, allow_null=True)
    image_path = serializers.CharField(required=False, allow_null=True)
    question_guides = QuestionGuideSerializer(required=False)


class QuestionPassageSerializer(serializers.Serializer):
    """Serializer for question passages"""
    id = serializers.CharField()
    question_type_id = serializers.CharField()
    content = serializers.CharField(required=False, allow_null=True)
    underline_text = serializers.CharField(allow_null=True)


class AnswerSerializer(serializers.Serializer):
    """Serializer for answers"""
    id = serializers.CharField()
    question_id = serializers.CharField()
    answer_text = serializers.CharField(required=False, allow_null=True)
    position = serializers.IntegerField(required=False, allow_null=True)
    show_order = serializers.IntegerField(required=False, allow_null=True)
    is_correct = serializers.BooleanField(required=False, allow_null=True)
    points = serializers.IntegerField(required=False, allow_null=True)


class QuestionSerializer(serializers.Serializer):
    """Serializer for questions"""
    id = serializers.CharField()
    exam_section_id = serializers.CharField()
    question_type_id = serializers.CharField()
    question_passages_id = serializers.CharField()
    score = serializers.IntegerField(required=False, allow_null=True)
    position = serializers.IntegerField(required=False, allow_null=True)
    explaination = serializers.CharField(required=False, allow_null=True)
    question_text = serializers.CharField(required=False, allow_null=True)
    underline_text = serializers.CharField(allow_null=True)
    passage = serializers.CharField(required=False, allow_null=True)
    question_audio = serializers.CharField(required=False, allow_null=True)
    question_image = serializers.CharField(required=False, allow_null=True)
    question_passages = QuestionPassageSerializer(many=True, required=False)
    answers = AnswerSerializer(many=True, required=False)


# Add questions field to QuestionTypeSerializer after QuestionSerializer is defined
QuestionTypeSerializer._declared_fields['questions'] = QuestionSerializer(many=True, required=False)

class ExamSectionSerializer(serializers.Serializer):
    """Serializer for exam sections"""
    id = serializers.CharField()
    exam_id = serializers.CharField()
    type = serializers.CharField(required=False, allow_null=True)
    position = serializers.IntegerField(required=False, allow_null=True)
    question_types = QuestionTypeSerializer(many=True, required=False)


class FullExamDataSerializer(serializers.Serializer):
    """Serializer for complete exam data"""
    exam = ExamSerializer()
    sections = ExamSectionSerializer(many=True)


class ExamResultSerializer(serializers.Serializer):
    """Serializer for exam results"""
    id = serializers.CharField()
    exam_id = serializers.CharField()
    student_id = serializers.CharField()
    sum_score = serializers.IntegerField(required=False, allow_null=True)
    duration = serializers.IntegerField(required=False, allow_null=True)
    datetime = serializers.DateTimeField(required=False, allow_null=True)


class StudentAnswerSerializer(serializers.Serializer):
    """Serializer for student answers"""
    id = serializers.CharField()
    exam_section_id = serializers.CharField()
    exam_question_id = serializers.CharField()
    chosen_answer_id = serializers.CharField()
    exam_result_id = serializers.CharField()
    position = serializers.IntegerField()
