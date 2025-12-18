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

    document?: PDFDocument
    form?: PDFForm

    constructor(data: PdfConstructor) {
        this.template_path = data.template_path
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

    async fillForm(fieldsToDelete: string[] = []) {
        if (!this.form || !this.document) {
            await this.init()
        }

        if (!this.form) {
            throw "Falha na inicialização do formulário"
        }

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
        const formFields = this.form.getFields()
        formFields.forEach((field, index) => {
            console.log(`${index + 1}. ${field.getName()} - Type: ${field.constructor.name}`)
        })
        console.log("=== END DEBUG ===")

        for (const field of this.fields) {
            try {
                // image field
                if (field.type === "image") {
                    const endpoint = field.value!.split("static/").pop()
                    const imageBytes = readFileSync(`static/${endpoint}`)
                    const extension = endpoint!.split(".").pop()
                    const image = extension === "png" ? await this.document!.embedPng(imageBytes) : await this.document!.embedJpg(imageBytes)
                    const button = this.form!.getButton(field.name)
                    button.setImage(image)
                    continue
                }

                // checkbox field
                if (field.type === "checkbox") {
                    const checkbox = this.form!.getCheckBox(field.name)
                    if (field.value === "true") {
                        checkbox.check()
                    } else {
                        checkbox.uncheck()
                    }
                    continue
                }

                // text field
                if (!field.type || field.type === "text") {
                    const formfield = this.form!.getTextField(field.name)
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

        for (const fieldName of fieldsToDelete) {
            try {
                const field = this.form.getField(fieldName)
                this.form.removeField(field)
            } catch (error) {
                console.log(`error deleting field ${fieldName} `)
                console.log(error)
            }
        }

        await this.save()

        // const inputPath = path.join(this.output_dir, this.filename)
        // const flattenedPath = path.join(this.output_dir, this.filename)
        // await this.flattenWithGhostscript(inputPath, flattenedPath)
    }

    async flattenWithGhostscript(inputPath: string, outputPath: string) {
        try {
            const command = `gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dAutoRotatePages=/None -sOutputFile="${outputPath}" "${inputPath}"`

            console.log(`Running Ghostscript command: ${command}`)
            const { stdout, stderr } = await execAsync(command)

            if (stderr) {
                console.log(`Ghostscript stderr: ${stderr}`)
            }

            console.log(`PDF flattened successfully: ${outputPath}`)
            return true
        } catch (error) {
            console.error(`Ghostscript error: ${error}`)
            return false
        }
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
