const YAML = require('yaml');
const fs = require('fs');
const uuid  = require('uuid');
const shortUuid  = require('short-uuid');

const levels = 10;
const branches = 2;
let leafNames = [];
let newLeafNames = [];
let hasStarted = false;

let totalCount = 1;
const limit = 500;

const jsonObject = {
    resources: [
        {
            name: `propertyCanvas${limit}`,
            type: 'PropertyBag',
            configuration: {
                key1: 'value1',    
                key2: 'value2',    
            }
        },
        {
            name: `buildInfoTrigger${limit}`,
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
            name: `canvasTest${limit}`,
            steps: []
        }
    ]
}

const createStep = (input, stopProp) => {
    const name = 'ct' + shortUuid.generate().replace(/-/g, '') + limit;
    if (!input || stopProp) {
        if (totalCount >= limit) return;
        const step = {
            name: name,
            type: 'Bash',
            configuration: {
                inputResources: [
                    {
                        name: `propertyCanvas${limit}`
                    },
                    {
                        name: `buildInfoTrigger${limit}`
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

fs.writeFileSync(`./canvas${limit}.yml`, doc.toString());
