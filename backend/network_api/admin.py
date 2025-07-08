from django.contrib import admin
from .models import Device, Connection, ConfigurationFile

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('hostname', 'ip_address', 'mac_address', 'device_type', 'is_online')
    list_filter = ('device_type', 'is_online')
    search_fields = ('hostname', 'ip_address', 'mac_address', 'notes')

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('source_device', 'target_device', 'connection_type')
    list_filter = ('connection_type',)
    search_fields = ('source_device__hostname', 'target_device__hostname')

@admin.register(ConfigurationFile)
class ConfigurationFileAdmin(admin.ModelAdmin):
    list_display = ('related_device', 'description', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('related_device__hostname', 'description')
