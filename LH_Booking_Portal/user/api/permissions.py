from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.lower() == 'admin'

class IsFaculty(BasePermission):
    """
    Custom permission to allow only faculty members to access.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.lower() == "faculty"


class IsStudent(BasePermission):
    """
    Custom permission to allow only students to access.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.lower() == "student"