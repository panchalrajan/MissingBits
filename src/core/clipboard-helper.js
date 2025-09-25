// Clipboard Helper Class
class ClipboardHelper {
    static async copy(htmlContent, plainTextContent) {
        try {
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
            const textBlob = new Blob([plainTextContent], { type: 'text/plain' });

            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': htmlBlob,
                    'text/plain': textBlob
                })
            ]);
            return true;
        } catch (err) {
            try {
                await navigator.clipboard.writeText(plainTextContent);
                return true;
            } catch (textErr) {
                return false;
            }
        }
    }
}
window.ClipboardHelper = ClipboardHelper;
