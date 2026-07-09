import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import ExcelJS from "exceljs"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  try {
    const units = await prisma.inventoryUnit.findMany({
      where: {
        status: 'available'
      },
      include: {
        catalogProduct: true,
        location: true
      },
      orderBy: {
        catalogProduct: {
          sku: 'asc'
        }
      }
    })

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Enhorabuena"
    workbook.created = new Date()

    // Agrupar unidades por ubicación
    const unitsByLocation: Record<string, typeof units> = {}
    for (const unit of units) {
      const locName = unit.location?.name || "Sin Ubicación"
      if (!unitsByLocation[locName]) {
        unitsByLocation[locName] = []
      }
      unitsByLocation[locName].push(unit)
    }

    // Crear una hoja por cada ubicación
    for (const [locName, locUnits] of Object.entries(unitsByLocation)) {
      // Limpiar nombre de hoja para que sea válido en Excel (max 31 chars, sin caracteres especiales []/*?\)
      const safeLocName = locName.replace(/[\[\]\/*?\\]/g, '').substring(0, 31)
      const worksheet = workbook.addWorksheet(safeLocName)

      worksheet.columns = [
        { header: 'Nombre', key: 'nombre', width: 40 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Precio', key: 'precio', width: 15 },
      ]

      // Dar formato a los encabezados
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).alignment = { horizontal: 'center' }

      for (const unit of locUnits) {
        // Calcular el precio actual
        let price = 0
        if (unit.customPrice) {
          price = Number(unit.customPrice)
        } else {
          // Si tiene precio de oferta, y queremos exportar el precio final
          if (unit.catalogProduct.compareAtPrice) {
            price = Math.min(Number(unit.catalogProduct.priceBetterware), Number(unit.catalogProduct.compareAtPrice))
          } else {
            price = Number(unit.catalogProduct.priceBetterware)
          }
        }

        worksheet.addRow({
          nombre: unit.catalogProduct.title,
          sku: unit.catalogProduct.sku,
          cantidad: 1,
          precio: price
        })
      }

      // Dar formato de moneda a la columna de precio
      worksheet.getColumn('precio').numFmt = '"$"#,##0.00'
    }

    // Si no hay unidades, crear una hoja vacía para evitar error
    if (workbook.worksheets.length === 0) {
      workbook.addWorksheet("Inventario Vacío")
    }

    const buffer = await workbook.xlsx.writeBuffer()

    const headers = new Headers()
    headers.append("Content-Disposition", 'attachment; filename="Inventario_Enhorabuena.xlsx"')
    headers.append("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    return new NextResponse(buffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error("Error exporting excel:", error)
    return NextResponse.json({ error: "Error al exportar inventario" }, { status: 500 })
  }
}
