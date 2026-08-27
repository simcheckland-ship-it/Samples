# ==============================================================================
# OUPUT 1: Clean IP Address Mapping (Removes CIDR Subnet /24)
# ==============================================================================
output "deployed_vm_ips" {
  description = "Clean IPv4 addresses mapped to each VM name for quick verification"
  value = {
    for name, vm in proxmox_virtual_environment_vm.hosts : 
    name => split("/", vm.initialization[0].ip_config[0].ipv4[0].address)[0]
  }
}

# ==============================================================================
# OUTPUT 2: Hardware Configuration Summary
# ==============================================================================
output "infrastructure_spec_summary" {
  description = "A clean breakdown of resource allocations across your active nodes"
  value = {
    for name, vm in proxmox_virtual_environment_vm.hosts : name => {
      vm_id  = vm.vm_id
      cores  = vm.cpu[0].cores
      ram_mb = vm.memory[0].dedicated
    }
  }
}
