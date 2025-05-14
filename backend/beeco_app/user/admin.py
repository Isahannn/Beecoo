from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from backend.beeco_app.user.models.user import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ['email', 'nickname', 'first_name', 'last_name', 'is_active', 'is_staff']
    search_fields = ['email', 'nickname']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'nickname', 'bio', 'avatar', 'location', 'date_of_birth')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Social', {'fields': ('followers', 'friends')}),
        ('Dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'nickname', 'password1', 'password2')}
        ),
    )
