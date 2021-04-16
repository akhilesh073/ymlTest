const YAML = require('yaml');
const fs = require('fs');
const uuid  = require('uuid');
const shortUuid  = require('short-uuid');

const jsonObject = {
    resources: [
        {
            name: 'propertyCanvas',
            type: 'PropertyBag',
            configuration: {
                key1: 'value1',    
                key2: 'value2',    
            }
        },
        {
            name: 'buildInfoTrigger',
            type: 'BuildInfo',
            configuration: {
                sourceArtifactory: 'art',    
                buildName: 'backend_build',    
                buildNumber: 1,    
            }
        },
    ],
    pipelines: [
        {
            name: `canvasTest`,
            steps: []
        }
    ]
}
const levels = 10;
const branches = 2;
let leafNames = [];
let newLeafNames = [];
let hasStarted = false;

let totalCount = 1;
const limit = 1000;
const createStep = (input, stopProp) => {
    const name = 'ct' + shortUuid.generate().replace(/-/g, '');
    if (!input || stopProp) {
        if (totalCount >= limit) return;
        const step = {
            name: name,
            type: 'Bash',
            configuration: {
                inputResources: [
                    {
                        name: 'propertyCanvas'
                    },
                    {
                        name: 'buildInfoTrigger'
                    },
                ],
            },
            execution: {
                onExecute: [
                    'sleep 1',
                    'echo "done"'
                ]
            }
        };
        if (input) {
            step.configuration.inputSteps = [{ name: input }];
        }
        jsonObject.pipelines[0].steps.push(step);
        totalCount++;
    }
    if (!stopProp) {
        for (let branchNo = 1; branchNo <= branches; branchNo++) {
            const leafName = createStep(input || name, true);
            newLeafNames.push(leafName);
        }
    }
    return name;
}

for (let levelNo = 1; levelNo <= levels; levelNo++) {
    if (!hasStarted) {
        createStep(null, false)
        hasStarted = true;
    } else {
        leafNames = newLeafNames.map(name => name);
        newLeafNames = [];
        for (leafName of leafNames) {
            createStep(leafName, false)
        }
    }
}

const doc = new YAML.Document();
doc.contents = jsonObject;

fs.writeFileSync('./canvas.yml', doc.toString());
