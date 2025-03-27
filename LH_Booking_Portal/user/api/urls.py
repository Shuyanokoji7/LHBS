from django.urls import path
from .views import RegisterView, LoginView, LogoutView, PasswordResetConfirmView, PasswordResetRequestView, AuthorityListView, CreateAuthorityView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path('authorities/', AuthorityListView.as_view(), name='authority-list'),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('createauthorities/', CreateAuthorityView.as_view(), name='create-authority'),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset-confirm/<int:user_id>/<str:token>/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
