INSERT INTO public.content (slug, title, body)
VALUES (
    'documentation',
    'Operational Manuals & System Documentation',
    '
        <h1>Operational Manuals</h1>
        <p>Access the latest operational procedures and safety checklists below.</p>
        
        <h2>Simulator Connectors</h2>
        
        <h3 id="x-plane">X-Plane Dispatch Connector (Lua)</h3>
        <p>This plugin requires manual configuration of your unique JWT token to authenticate with the HEMS Dispatch API.</p>
        
        <h4>Installation Steps:</h4>
        <ol>
            <li>Download the <code>hems_xplane_connector.lua</code> file.</li>
            <li>Place the file into your X-Plane installation directory: <code>Resources/plugins/FlyWithLua/Scripts/</code></li>
            <li>Open the file and locate the line: <code>local HEMS_AUTH_TOKEN = "YOUR_JWT_TOKEN_HERE"</code></li>
            <li>Replace <code>"YOUR_JWT_TOKEN_HERE"</code> with your current JWT token found on the <a href="/user">My Profile</a> page.</li>
            <li>Restart X-Plane. The in-sim UI panel will appear automatically.</li>
        </ol>
        
        <h3 id="msfs">MSFS 2020/2024 Connector (WASM)</h3>
        <p>This connector uses a standard API key for telemetry transmission.</p>
        
        <h4>Installation Steps:</h4>
        <ol>
            <li>Download the community package ZIP file.</li>
            <li>Extract the contents into your MSFS Community folder.</li>
            <li>In the HEMS Dispatch System (Web App), navigate to the <a href="/plugins">Plugins page</a> to retrieve your unique API Key.</li>
            <li>Enter the API Key into the in-sim configuration panel (usually found in the top toolbar).</li>
        </ol>
    '
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = NOW();