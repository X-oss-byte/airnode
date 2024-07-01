terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.19"
    }
  }

  required_version = "~> 1.9"
}

provider "aws" {
  region = var.aws_region
}
