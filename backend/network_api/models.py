from django.db import models
from django.utils.translation import gettext_lazy as _

class Device(models.Model):
    """
    Model representing a network device (computer, router, switch, etc.)
    """
    class DeviceType(models.TextChoices):
        COMPUTER = 'COMPUTER', _('Computer')
        SERVER = 'SERVER', _('Server')
        ROUTER = 'ROUTER', _('Router')
        SWITCH = 'SWITCH', _('Switch')
        PRINTER = 'PRINTER', _('Printer')
        MOBILE = 'MOBILE', _('Mobile Device')
        IOT = 'IOT', _('IoT Device')
        OTHER = 'OTHER', _('Other')

    hostname = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    mac_address = models.CharField(max_length=17, null=True, blank=True)
    device_type = models.CharField(
        max_length=20,
        choices=DeviceType.choices,
        default=DeviceType.OTHER
    )
    photo = models.ImageField(upload_to='device_photos/', null=True, blank=True)
    notes = models.TextField(blank=True)
    is_online = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.hostname

class Connection(models.Model):
    """
    Model representing a connection between two devices
    """
    class ConnectionType(models.TextChoices):
        LAN = 'LAN', _('LAN')
        WIFI = 'WIFI', _('WiFi')
        BLUETOOTH = 'BLUETOOTH', _('Bluetooth')
        USB = 'USB', _('USB')
        SERIAL = 'SERIAL', _('Serial')
        OTHER = 'OTHER', _('Other')

    source_device = models.ForeignKey(
        Device, 
        on_delete=models.CASCADE,
        related_name='outgoing_connections'
    )
    target_device = models.ForeignKey(
        Device, 
        on_delete=models.CASCADE,
        related_name='incoming_connections'
    )
    connection_type = models.CharField(
        max_length=20,
        choices=ConnectionType.choices,
        default=ConnectionType.LAN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.source_device} -> {self.target_device} ({self.get_connection_type_display()})"

class ConfigurationFile(models.Model):
    """
    Model representing a configuration file for a device
    """
    related_device = models.ForeignKey(
        Device, 
        on_delete=models.CASCADE,
        related_name='configuration_files'
    )
    file = models.FileField(upload_to='config_files/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Config for {self.related_device}: {self.description}"
