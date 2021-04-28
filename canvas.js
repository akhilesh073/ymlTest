const YAML = require('yaml');
const fs = require('fs');

const limit = 500;
const levels = 20;
const branches = 25;
const steps = 1;

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

const rootStep = {
    name: `canvasTest_Root${limit}`,
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
jsonObject.pipelines[0].steps.push(rootStep);
const addLevel = (levelTrack) => {
    // console.log("Level", levelTrack)
    for (let branchTrack = 1; branchTrack <= branches; branchTrack++) {
        addBranch(levelTrack, branchTrack)
    }
}

const addBranch = (levelTrack, branchTrack) => {
    // console.log("Branch", branchTrack)
    for (let stepTrack = 1; stepTrack <= steps; stepTrack++) {
        addStep(levelTrack, branchTrack, stepTrack)
    }
}

const addStep = (levelTrack, branchTrack, stepTrack) => {
    const step = {
        name: `canvasTest${limit}_${levelTrack}_${branchTrack}_${stepTrack}`,
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
    if (levelTrack === 1 && stepTrack === 1) {
        step.configuration.inputSteps = [
            {
                name: `canvasTest_Root${limit}`
            }
        ]
    } else {
        if (levelTrack > 1 && stepTrack === 1) {
            step.configuration.inputSteps = [
                {
                    name: `canvasTest${limit}_${levelTrack - 1}_${branchTrack}_${steps}`
                }
            ]
        } else {
            step.configuration.inputSteps = [
                {
                    name: `canvasTest${limit}_${levelTrack}_${branchTrack}_${stepTrack - 1}`
                }
            ]
        }
    }
    jsonObject.pipelines[0].steps.push(step);
}


for (levelTrack = 1; levelTrack <= levels; levelTrack++) {
    addLevel(levelTrack)
}

const doc = new YAML.Document();
doc.contents = jsonObject;

fs.writeFileSync(`./canvas${limit}.yml`, doc.toString());
