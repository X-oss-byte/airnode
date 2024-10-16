terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72"
    }
  }

  required_version = "~> 1.5"
}

provider "aws" {
  region = var.aws_region
}
