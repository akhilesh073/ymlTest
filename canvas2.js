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
let track = 1;
const createStep = (input, noTrack) => {
    if (track > 100) return;
    track++;

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
    if (input) {
        step.configuration.inputSteps = [{ name: input }];
    }
    if (!noTrack) {
        createStep(name, true);
        createStep(name, true);
        createStep(name, true);
    } else {
        
    }
    jsonObject.pipelines[0].steps.push(step);
}

createStep();

const doc = new YAML.Document();
doc.contents = jsonObject;

fs.writeFileSync('./canvas.yml', doc.toString());
