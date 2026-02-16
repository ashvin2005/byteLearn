import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadPDF = async (element: HTMLElement, title: string) => {
  try {
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
