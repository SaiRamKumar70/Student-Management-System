from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "name", "email", "phone", "course", "age", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_age(self, value):
        if value < 10 or value > 100:
            raise serializers.ValidationError("Age must be between 10 and 100.")
        return value
