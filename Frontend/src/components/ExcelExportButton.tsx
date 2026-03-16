import React from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExcelExportButtonProps {
  data: any[]
  filename?: string
  sheetName?: string
  buttonText?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link' | 'destructive'
  className?: string
  disabled?: boolean
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  data,
  filename = 'export',
  sheetName = 'Sheet1',
  buttonText = 'Export to Excel',
  variant = 'outline',
  className = '',
  disabled = false
}) => {
  const exportToExcel = () => {
    if (!data || data.length === 0) return

    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Convert JSON data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate the Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  return (
    <Button
      variant={variant}
      onClick={exportToExcel}
      disabled={disabled || !data || data.length === 0}
      className={`rounded-xl font-bold flex items-center gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      {buttonText}
    </Button>
  )
}
