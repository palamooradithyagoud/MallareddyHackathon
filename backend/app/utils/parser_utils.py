import PyPDF2
import docx
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from PDF bytes."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF file: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from Word DOCX bytes."""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = []
        for para in doc.paragraphs:
            text.append(para.text)
        return "\n".join(text).strip()
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX file: {str(e)}")

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Determines file type and extracts text accordingly."""
    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ["docx", "doc"]:
        return extract_text_from_docx(file_bytes)
    elif ext in ["txt", "md"]:
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")
