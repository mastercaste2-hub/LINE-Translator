package it.linetranslator.app;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareIntentPlugin.class);
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShareIntent(intent);
    }

    private void handleShareIntent(Intent intent) {
        if (intent == null
                || !Intent.ACTION_SEND.equals(intent.getAction())
                || !"text/plain".equals(intent.getType())
                || getBridge() == null) {
            return;
        }

        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (sharedText == null || sharedText.trim().isEmpty()) {
            return;
        }

        com.getcapacitor.PluginHandle pluginHandle = getBridge().getPlugin("ShareIntent");
        if (pluginHandle == null) {
            return;
        }

        Plugin plugin = pluginHandle.getInstance();
        if (plugin instanceof ShareIntentPlugin) {
            ((ShareIntentPlugin) plugin).receiveSharedText(sharedText);
        }
    }
}
