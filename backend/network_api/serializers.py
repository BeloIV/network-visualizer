from rest_framework import serializers
from .models import Device, Connection, ConfigurationFile

class ConfigurationFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfigurationFile
        fields = ['id', 'file', 'description', 'uploaded_at', 'related_device']
        read_only_fields = ['uploaded_at']

class DeviceSerializer(serializers.ModelSerializer):
    configuration_files = ConfigurationFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Device
        fields = [
            'id', 'hostname', 'ip_address', 'mac_address', 'device_type', 
            'photo', 'notes', 'is_online', 'created_at', 'updated_at',
            'configuration_files'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ConnectionSerializer(serializers.ModelSerializer):
    source_device_hostname = serializers.ReadOnlyField(source='source_device.hostname')
    target_device_hostname = serializers.ReadOnlyField(source='target_device.hostname')
    
    class Meta:
        model = Connection
        fields = [
            'id', 'source_device', 'target_device', 'connection_type', 
            'created_at', 'updated_at', 'source_device_hostname', 'target_device_hostname'
        ]
        read_only_fields = ['created_at', 'updated_at']