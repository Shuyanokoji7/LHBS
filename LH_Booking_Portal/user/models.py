from django.db import models
from django.contrib.auth.models import AbstractUser


class Authority(models.Model):
    
    """Predefined authorities (Name & Email)."""
    name = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class User(AbstractUser):

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
        ('student', 'Student'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    # Many-to-Many with explicit ordering
    authorities = models.ManyToManyField(Authority, through="UserAuthority", blank=True)
    
    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = 'admin'
        super().save(*args, **kwargs)
        
    def get_ordered_authorities(self):
        return self.userauthority_set.order_by("order")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"



class UserAuthority(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    authority = models.ForeignKey(Authority, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)  # Order of authority

    class Meta:
        unique_together = ("user", "authority")  # Prevent duplicate authorities
        ordering = ["order"]  # Ensures authorities are retrieved in order

    def __str__(self):
        return f"{self.user.username} → {self.authority.name} (Order: {self.order})"
