const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;

var configTags = argv.configTags || [];

function fetchConfig(basePath, dir) {
    const files = fs.readdirSync(`${basePath}/${dir}`);
    let configs = [];
    files.forEach(function (file) {
        if (file[0] !== '.') {
            if (fs.lstatSync(`${basePath}/${dir}/${file}`).isDirectory()) {
                configs = configs.concat(fetchConfig(`${basePath}/${dir}`, file));
            }
            else {
                configs.push(`${basePath}/${dir}/${file}`);
            }
        }
    });
    return configs;
}

function fetchAllConfigs(basePath, dir) {
    const allConfigs = fetchConfig(basePath, dir);
    return allConfigs.map(config => {
        const configObj = require(config);
        return {
            id: config,
            ...configObj
        };
    }).filter(config => !config.exclude)
}


function buildJobs(basePath, dir) {
    const configs = fetchAllConfigs(basePath, dir);
    const jobsArray = {};

    configs.forEach(config => {
        let jobEnv;
        if (config.jobTypes.env) {
            jobEnv = config.env;
            delete config.env;
        }
        for (const jobTypeId in config.jobTypes) {
            const jobType = config.jobTypes[jobTypeId];
            const jobTypeParams = jobType.params || {};
            for (const jobId in jobType.jobs) {
                if (!jobsArray[jobTypeId]) {
                    jobsArray[jobTypeId] = {};
                }
                const newJobId = config.id + "_" + jobId;
                const job = {
                    ...jobType.jobs[jobId],
                    ...jobTypeParams
                };
                job.id = jobId;
                if (!job.env && jobEnv) {
                    job.env = jobEnv;
                }
                jobsArray[jobTypeId][newJobId] = job;
                delete config.jobTypes[jobTypeId][jobId];
            }
        }
    });

    return jobsArray;

}

function load(configPath, jobDirPath) {
    const jobs = buildJobs(configPath, '');
    runJobs(jobDirPath, jobs);
}

function runJobs(jobDirPath, jobsArray) {
    for (var jobType in jobsArray) {
        try {
            var jobPath = path.resolve(jobDirPath, jobType.toLowerCase() + ".js");

            var jobClass = require(jobPath);
            var jobGroup = jobsArray[jobType];
            for (var id in jobGroup) {
                if (typeof jobGroup[id].env === "undefined") {
                    jobGroup[id].env = "live";
                }

                var job = new jobClass(jobGroup[id]);

                job.start();
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = {
    load: load
};