from rest_framework import permissions

class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and
                    request.user.is_authenticated and
                    request.user.role == 'lecturer')

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'student'

class IsReservationOwner(permissions.BasePermission):
    #dostep do obiektu (put/delete/get_ tylko wlascicielowi rezerwacji
    def has_object_permission(self, request, view, obj):
        return obj.student == request.user