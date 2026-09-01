
terraform {
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "0.66.0"
    }
  }

  backend "local" {}
}

# Declare the set_prefix variable so Terraform knows it exists
variable "set_prefix" {
  type        = string
  description = "The prefix identifier for this specific deployment set (e.g., 200 or 210)"
}

variable "proxmox_endpoint" { type = string }
variable "proxmox_token"    { type = string }
variable "server_passwords" { 
  type    = map(string)
  default = {}
}

# Load the shared YAML configuration file natively
locals {
   infra_data = yamldecode(file("${path.module}/../../server-set-${var.set_prefix}-infra.yml"))
}

provider "proxmox" {
  endpoint  = var.proxmox_endpoint
  api_token = var.proxmox_token
  insecure  = true
}

#  Deploy your server group using the parsed YAML data map
resource "proxmox_virtual_environment_vm" "hosts" {
  for_each = local.infra_data.server_inventory

  name        = replace(each.key, "_", "-")
  node_name   = "pve"
  vm_id       = each.value.vm_id
  stop_on_destroy = true  

  agent {
    enabled = true
    timeout = "0s"  # Stops Terraform from freezing while waiting for a guest IP
  }

  clone {
    vm_id = 9002
    full  = false 
  }

  cpu { cores = each.value.cores }
  memory { dedicated = each.value.ram }

   network_device {
    bridge = each.value.network.bridge
    model  = each.value.network.card
  }

  initialization {
    user_account {
      username = each.value.username
      # flatten safely handles single string entries or list arrays seamlessly
      keys     = flatten([each.value.ssh_keys])
      password = lookup(var.server_passwords, each.key, null)
    }

    ip_config {
      ipv4 {
        address = each.value.ip_address
        gateway = each.value.gateway
      }
    }

    dns {
      servers = each.value.dns.servers
      domain  = lookup(each.value.dns, "domain", null) # Safe lookup if domain is missing
    }
  }
  

}


# Automatically generate/overwrite your Ansible inventory file
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../2-system/ansible/inventory.ini"
  
  content = <<EOT
[hosts_${var.set_prefix}]
%{ for server_key, server_data in local.infra_data.server_inventory ~}
${replace(server_key, "_", "-")} ansible_host=${split("/", server_data.ip_address)[0]} ansible_user=${server_data.username} ansible_ssh_private_key_file=~/.ssh/runner-vm
%{ endfor ~}

[proxy_${var.set_prefix}]
%{ for server_key, server_data in local.infra_data.server_inventory ~}
%{ if server_data.vm_id == 200 || server_data.vm_id == 210 ~}
${replace(server_key, "_", "-")}
%{ endif ~}
%{ endfor ~}

[api_${var.set_prefix}]
%{ for server_key, server_data in local.infra_data.server_inventory ~}
%{ if server_data.vm_id == 201 || server_data.vm_id == 211 ~}
${replace(server_key, "_", "-")}
%{ endif ~}
%{ endfor ~}

[image_server_${var.set_prefix}]
%{ for server_key, server_data in local.infra_data.server_inventory ~}
%{ if server_data.vm_id == 202 || server_data.vm_id == 212 ~}
${replace(server_key, "_", "-")}
%{ endif ~}
%{ endfor ~}
EOT

  depends_on = [proxmox_virtual_environment_vm.hosts]
}



