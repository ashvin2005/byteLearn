import pypdf

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF file using pypdf.
    
    Args:
        file_path (str): The path to the PDF file.
        
    Returns:
        str: The extracted plain text from the PDF.
    """
    extracted_text = ""
    with open(file_path, "rb") as file:
        reader = pypdf.PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n\n"
                
    return extracted_text.strip()

