const YAML = require('yaml');
const fs = require('fs');
const uuid  = require('uuid');

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
let track = 1;
const createStep = (input) => {
    if (track >= 100) return;
    track++;

    const name = uuid.v4()
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
    createStep(name);
    createStep(name);
    jsonObject.pipelines[0].steps.push(step);
}

createStep();

const doc = new YAML.Document();
doc.contents = jsonObject;

fs.writeFileSync('./canvas.yml', doc.toString());
