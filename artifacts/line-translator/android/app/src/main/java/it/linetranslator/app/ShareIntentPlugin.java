package it.linetranslator.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ShareIntent")
public class ShareIntentPlugin extends Plugin {

    private String pendingText;

    public void receiveSharedText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return;
        }

        pendingText = text;
        JSObject data = new JSObject();
        data.put("text", text);
        notifyListeners("sharedText", data);
    }

    @PluginMethod
    public void getPendingShare(PluginCall call) {
        JSObject result = new JSObject();

        if (pendingText != null && !pendingText.trim().isEmpty()) {
            result.put("text", pendingText);
            pendingText = null;
        }

        call.resolve(result);
    }
}