from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import subprocess
import platform
import logging
import ipaddress
import socket
import concurrent.futures

from .models import Device, Connection, ConfigurationFile
from .serializers import DeviceSerializer, ConnectionSerializer, ConfigurationFileSerializer

class DeviceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows devices to be viewed or edited.
    """
    queryset = Device.objects.all().order_by('hostname')
    serializer_class = DeviceSerializer

    @action(detail=True, methods=['post'])
    def check_online_status(self, request, pk=None):
        """
        Check if a device is online using ping, then ARP as a fallback. Log all output and errors.
        """
        device = self.get_object()
        import sys
        if not device.ip_address:
            return Response(
                {"error": "Device has no IP address"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Special handling for localhost/127.0.0.1
        if device.ip_address in ['localhost', '127.0.0.1', '::1']:
            device.is_online = True
            device.save()
            return Response({"status": "Device is online (localhost)"})

        system = platform.system().lower()
        param = '-n' if system == 'windows' else '-c'
        if system == 'darwin':
            timeout_param = '-t'
        else:
            timeout_param = '-w' if system == 'windows' else '-W'
        timeout_value = '1'
        command = ['ping', param, '1', timeout_param, timeout_value, device.ip_address]
        logging.debug(f"Pinging {device.ip_address} with command: {' '.join(command)}")
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True, timeout=2)
            logging.debug(f"Ping output: {output}")
            device.is_online = True
            device.save()
            return Response({"status": "Device is online", "output": output, "method": "ping"})
        except Exception as e:
            logging.debug(f"Ping failed: {e}")
            # Try ARP as a fallback
            try:
                arp_output = subprocess.check_output(['arp', '-a'], universal_newlines=True)
                logging.debug(f"ARP output: {arp_output}")
                if device.ip_address in arp_output:
                    device.is_online = True
                    device.save()
                    return Response({"status": "Device is online (ARP fallback)", "arp_output": arp_output, "method": "arp"})
            except Exception as arp_e:
                logging.debug(f"ARP failed: {arp_e}")
            device.is_online = False
            device.save()
            return Response({"status": "Device is offline", "ping_error": str(e)}, status=200)

    @action(detail=False, methods=['get'])
    def filter_by_type(self, request):
        """
        Filter devices by type
        """
        device_type = request.query_params.get('type', None)
        if device_type is not None:
            devices = Device.objects.filter(device_type=device_type)
            serializer = self.get_serializer(devices, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Type parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def filter_by_status(self, request):
        """
        Filter devices by online status
        """
        is_online = request.query_params.get('is_online', None)
        if is_online is not None:
            is_online = is_online.lower() == 'true'
            devices = Device.objects.filter(is_online=is_online)
            serializer = self.get_serializer(devices, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "is_online parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['post'])
    def autodiscover(self, request):
        """
        Scan a subnet for online devices and return their IPs and hostnames, using threads for speed.
        """
        subnet = request.data.get('subnet', '192.168.1.0/24')
        discovered = []
        try:
            net = ipaddress.ip_network(subnet, strict=False)
        except Exception as e:
            return Response({'error': f'Invalid subnet: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        system = platform.system().lower()
        param = '-n' if system == 'windows' else '-c'
        if system == 'darwin':  # macOS
            timeout_param = '-t'
        else:
            timeout_param = '-w' if system == 'windows' else '-W'
        timeout_value = '1'

        def ping_ip(ip_str):
            command = ['ping', param, '1', timeout_param, timeout_value, ip_str]
            try:
                subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True, timeout=2)
                try:
                    hostname = socket.gethostbyaddr(ip_str)[0]
                except Exception:
                    hostname = None
                return {'ip_address': ip_str, 'hostname': hostname}
            except Exception:
                return None

        with concurrent.futures.ThreadPoolExecutor(max_workers=32) as executor:
            futures = {executor.submit(ping_ip, str(ip)): str(ip) for ip in net.hosts()}
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    discovered.append(result)

        return Response(discovered)

class ConnectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows connections to be viewed or edited.
    """
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer

    @action(detail=False, methods=['get'])
    def filter_by_device(self, request):
        """
        Filter connections by device
        """
        device_id = request.query_params.get('device_id', None)
        if device_id is not None:
            connections = Connection.objects.filter(
                source_device_id=device_id
            ) | Connection.objects.filter(
                target_device_id=device_id
            )
            serializer = self.get_serializer(connections, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "device_id parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

class ConfigurationFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows configuration files to be viewed or edited.
    """
    queryset = ConfigurationFile.objects.all()
    serializer_class = ConfigurationFileSerializer
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['get'])
    def filter_by_device(self, request):
        """
        Filter configuration files by device
        """
        device_id = request.query_params.get('device_id', None)
        if device_id is not None:
            files = ConfigurationFile.objects.filter(related_device_id=device_id)
            serializer = self.get_serializer(files, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "device_id parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
