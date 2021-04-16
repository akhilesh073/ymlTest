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
const levels = 5;
const branches = 3;
let leafNames = [];
let newLeafNames = [];
let hasStarted = false;

const createStep = (input, stopProp) => {
    const name = 'ct' + shortUuid.generate().replace(/-/g, '');
    if (!input || stopProp) {
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
        for (leafName of leafNames) {
            createStep(leafName, false)
        }
    }
}

const doc = new YAML.Document();
doc.contents = jsonObject;

fs.writeFileSync('./canvas.yml', doc.toString());
