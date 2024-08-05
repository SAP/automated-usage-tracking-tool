void call(Map parameters) {
    echo "Start - Extension for stage: ${parameters.stageName} and branch ${parameters.script.commonPipelineEnvironment.gitBranch}"

    // Execute original stage as defined in the template
    parameters.originalStage()

    //access config
    echo "Current stage config: ${parameters.config}"

    if (env.BRANCH_NAME.startsWith('PR-'))
    {
        // Execute original stage as defined in the template
        parameters.originalStage()
    }
    echo "End - Extension for stage: ${parameters.stageName}"
}
return this
