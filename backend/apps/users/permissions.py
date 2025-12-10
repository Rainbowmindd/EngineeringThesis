from rest_framework import permissions

class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user and request.user.is_authenticated and  request.user.is_superuser:
            return True

        return request.user.role == 'lecturer'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser:
            return True

        return request.user.role == 'student'

class IsReservationOwner(permissions.BasePermission):
    #dostep do obiektu (put/delete/get_ tylko wlascicielowi rezerwacjiś
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        return obj.student == request.user