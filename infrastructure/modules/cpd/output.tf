output "cpd_primary_access_key" {
  value = azurerm_storage_account.cpd.primary_access_key
}

output "cpd_static_web_url" {
  value = azurerm_storage_account.cpd.primary_web_endpoint
}
