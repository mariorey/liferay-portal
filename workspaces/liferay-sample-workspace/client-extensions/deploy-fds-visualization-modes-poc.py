#!/usr/bin/env python3
"""Builds and deploys the LPD-43793 visualization mode PoC client extensions.

PROVISIONAL: `gradlew deploy` cannot build these yet. The workspace resolves
`com.liferay.gradle.plugins.workspace` from a published version, and that jar's
`client-extension.properties` has no `fdsVisualizationMode` entry, so
`createClientExtensionConfig` fails with "unknown classification". The entry is
already added under `modules/sdk/gradle-plugins-workspace`; once that plugin is
republished (`installCache updateFileVersions`, then `ant setup-sdk`), this
script can go away in favour of `gradlew deploy`.

Until then this reproduces what the Gradle tasks would have produced: it bundles
each project with esbuild, writes the `*.client-extension-config.json` and
`WEB-INF/liferay-plugin-package.properties` the WAB generator expects, and drops
the zip into `<bundles>/osgi/client-extensions`.

Usage: python3 deploy-fds-visualization-modes-poc.py [<bundles-dir>]
"""

import json
import os
import re
import subprocess
import sys
import time
import zipfile

BUNDLES = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/dev3/bundles")
PID = "com.liferay.client.extension.type.configuration.CETConfiguration"

PROJECTS = [
    {
        "label": "Liferay Sample Kanban Board",
        "name": "liferay-sample-fds-visualization-mode-kanban",
        "thumbnail": "columns",
    },
    {
        "label": "Liferay Sample Product Catalog",
        "name": "liferay-sample-fds-visualization-mode-product-catalog",
        "thumbnail": "grid",
    },
]

for project in PROJECTS:
    name = project["name"]
    static_dir = f"{name}/build/static"

    if os.path.isdir(static_dir):
        for stale in os.listdir(static_dir):
            os.remove(f"{static_dir}/{stale}")

    subprocess.run(
        [
            "npx", "--yes", "esbuild@0.25.0", "src/index.jsx",
            "--outdir=build/static", "--bundle", "--entry-names=[name].[hash]",
            "--format=esm", "--external:react", "--loader:.jsx=jsx",
            "--minify",
        ],
        check=True,
        cwd=name,
    )

    js = [f for f in os.listdir(static_dir) if f.endswith(".js")]
    assert len(js) == 1, (name, js)
    js = js[0]

    project_id = re.sub(r"[^a-z0-9]", "", name.lower())

    config = {
        f"{PID}~{name}": {
            ":configurator:policy": "force",
            "baseURL": "${portalURL}/o/" + name,
            "buildTimestamp": int(time.time() * 1000),
            "description": "",
            "dxp.lxc.liferay.com.virtualInstanceId": "default",
            "name": project["label"],
            "projectId": project_id,
            "projectName": name,
            "properties": [],
            "sourceCodeURL": "",
            "type": "fdsVisualizationMode",
            "typeSettings": [
                f"thumbnail={project['thumbnail']}",
                f"url={js}",
            ],
            "webContextPath": "/" + name,
        }
    }

    plugin_package = (
        f"Bundle-SymbolicName={project_id}\n"
        "Liferay-Client-Extension-Frontend=static/\n"
        "module-group-id=liferay\n"
        f"name={name}\n"
    )

    os.makedirs(f"{name}/dist", exist_ok=True)
    zip_path = f"{name}/dist/{name}.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{name}.client-extension-config.json", json.dumps(config, indent=4))
        zf.writestr("WEB-INF/liferay-plugin-package.properties", plugin_package)
        zf.write(f"{static_dir}/{js}", f"static/{js}")

    os.replace(zip_path, f"{BUNDLES}/osgi/client-extensions/{name}.zip")

    print("deployed", name, js)
