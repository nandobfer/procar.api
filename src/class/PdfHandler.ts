import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { WithoutFunctions } from "./helpers"
import { PDFButton, PDFDocument, PDFForm, PDFTextField } from "pdf-lib"
import path from "path"
import fontkit from "@pdf-lib/fontkit"
import { getLocalUrl } from "../tools/getLocalUrl"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export interface PdfField {
    name: string
    value?: string
    bold?: boolean
    type?: "text" | "image" | "checkbox"
}

type PdfConstructor = Omit<WithoutFunctions<PdfHandler>, "fullpath">

export class PdfHandler {
    template_path: string
    output_dir: string
    filename: string
    font?: { regular: string; bold: string }
    fields: PdfField[]
    fullpath: string

    pagesFields?: PdfField[][]
    document?: PDFDocument
    form?: PDFForm

    constructor(data: PdfConstructor) {
        this.template_path = data.template_path
        this.pagesFields = data.pagesFields
        this.output_dir = data.output_dir
        this.filename = data.filename
        this.font = data.font
        this.fields = data.fields
        this.fullpath = getLocalUrl() + `/${this.output_dir}/${this.filename}`
    }

    async init() {
        const buffer = readFileSync(this.template_path)
        this.document = await PDFDocument.load(buffer)
        this.document.registerFontkit(fontkit)
        this.form = this.document.getForm()
    }

    async fillPagesFields() {
        if (!this.pagesFields || this.pagesFields.length === 0) {
            return
        }

        console.log("Filling additional pages fields:")
        console.log(this.pagesFields)

        for (const [pageIndex, pageFields] of this.pagesFields.entries()) {
            const page = await PDFDocument.load(readFileSync(this.template_path))
            const pageForm = page.getForm()
            await this.fillFields(page, pageForm, [...this.fields, ...pageFields])
            await page.save()

            const [copiedPage] = await this.document!.copyPages(page, [0])
            this.document!.addPage(copiedPage)
        }
    }

    async fillFields(document: PDFDocument, form: PDFForm, fields: PdfField[]) {
        let customFontRegular
        let customFontBold

        if (this.font) {
            const fontRegularBytes = readFileSync(this.font.regular)
            customFontRegular = await this.document!.embedFont(fontRegularBytes)

            if (this.font.bold) {
                const fontBoldBytes = readFileSync(this.font.bold)
                customFontBold = await this.document!.embedFont(fontBoldBytes)
            } else {
                customFontBold = customFontRegular
            }
        }

        // Debug form fields
        console.log("=== DEBUG: Form Fields ===")
        const formFields = form.getFields()
        formFields.forEach((field, index) => {
            console.log(`${index + 1}. ${field.getName()} - Type: ${field.constructor.name}`)
        })
        console.log("=== END DEBUG ===")

        for (const field of fields) {
            console.log(field)
            try {
                // image field
                if (field.type === "image") {
                    const endpoint = field.value!.split("static/").pop()
                    const imageBytes = readFileSync(`static/${endpoint}`)
                    const extension = endpoint!.split(".").pop()
                    const image = extension === "png" ? await document.embedPng(imageBytes) : await document.embedJpg(imageBytes)
                    const button = form.getButton(field.name)
                    button.setImage(image)
                    continue
                }

                // checkbox field
                if (field.type === "checkbox") {
                    const checkbox = form.getCheckBox(field.name)
                    if (field.value === "true") {
                        checkbox.check()
                    } else {
                        checkbox.uncheck()
                    }
                    continue
                }

                // text field
                if (!field.type || field.type === "text") {
                    const formfield = form.getTextField(field.name)
                    formfield.setText(field.value)
                    if (this.font) {
                        formfield.updateAppearances(field.bold ? customFontBold! : customFontRegular!)
                    }
                    continue
                }
            } catch (error) {
                console.log(`error setting ${field.name} `)
                console.log(error)
                console.log(field.value)
            }
        }
    }

    async fillForm(fieldsToDelete: string[] = []) {
        if (!this.form || !this.document) {
            await this.init()
        }

        if (!this.form || !this.document) {
            throw "Falha na inicialização do formulário"
        }

        const firstPageFields = this.pagesFields?.shift() || []

        await this.fillFields(this.document, this.form, [...this.fields, ...firstPageFields])

        for (const fieldName of fieldsToDelete) {
            try {
                const field = this.form.getField(fieldName)
                this.form.removeField(field)
            } catch (error) {
                console.log(`error deleting field ${fieldName} `)
                console.log(error)
            }
        }

        if (this.pagesFields && this.pagesFields.length > 0) {
            await this.fillPagesFields()
        }

        await this.save()
    }

    async save() {
        if (!this.document) {
            throw "documento não inicializado"
        }

        if (!existsSync(this.output_dir)) {
            mkdirSync(this.output_dir, { recursive: true })
        }

        const file = await this.document.save()
        writeFileSync(path.join(this.output_dir, this.filename), file)
    }
}
