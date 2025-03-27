from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", include("user.api.urls")),
    path("api/timetable/", include("timetable.api.urls")),
    path("api/bookings/", include("bookings.api.urls")),
]
