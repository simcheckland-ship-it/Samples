
terraform {
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "0.66.0"
    }
  }

  # anchor state memory safely outside GitHub's workspace
  backend "local" {
    path = "/var/lib/terraform/proxmox-infra.tfstate"
  }
}

variable "proxmox_endpoint" { type = string }
variable "proxmox_token"    { type = string }
variable "server_passwords" { 
  type    = map(string)
  default = {}
}

# Load the shared YAML configuration file natively
locals {
  infra_data = yamldecode(file("${path.module}/../infrastructure/server-set-200-infra.yml"))
}

provider "proxmox" {
  endpoint  = var.proxmox_endpoint
  api_token = var.proxmox_token
  insecure  = true
}

#  Deploy your server group using the parsed YAML data map
resource "proxmox_virtual_environment_vm" "docker_hosts" {
  for_each = local.infra_data.server_inventory

  name        = replace(each.key, "_", "-")

  node_name   = "pve"
  vm_id       = each.value.vm_id
  stop_on_destroy = true  

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
  filename = "${path.module}/../ansible/inventory.ini"
  
  content = <<EOT
[docker_hosts]
%{ for server_key, server_data in local.infra_data.server_inventory ~}
${replace(server_key, "_", "-")} ansible_host=${split("/", server_data.ip_address)[0]} ansible_user=${server_data.username} ansible_ssh_private_key_file=~/.ssh/runner-vm
%{ endfor ~}
EOT

  depends_on = [proxmox_virtual_environment_vm.docker_hosts]
}



