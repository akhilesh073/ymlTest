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
const levels = 3;
let leafNames = [];
let hasStarted = false;

const createStep = (input, stopProp) => {
    if (!input) console.log("noin")
    const name = 'ct' + shortUuid.generate().replace(/-/g, '');
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
    console.log('step created')
    if (input) {
        step.configuration.inputSteps = [{ name: input }];
    }
    jsonObject.pipelines[0].steps.push(step);
    if (!stopProp) {
        for (let count = 1; count <= 3; count++) {
            const leafName = createStep(name, true);
            console.log("LEAF", leafName);
            leafNames.push(createStep(name, true));
        }
    }
    return name;
}

for (let levelNo = 1; levelNo <= levels; levelNo++) {
    if (!hasStarted) {
        createStep(null)
        hasStarted = true;
    } else {
        console.log(leafNames);
        for (leafName of leafNames) {
            createStep(leafName)
        }
    }
    leafNames = [];
}

const doc = new YAML.Document();
doc.contents = jsonObject;

fs.writeFileSync('./canvas.yml', doc.toString());
