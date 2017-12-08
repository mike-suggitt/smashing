const path = require('path');
const fs = require('fs');
const argv = require('yargs').argv;

const jobsArray = [];
const configTags = argv.configTags || [];

//Get application configs
function getConfigs(_base, _dir) {
    var _path = _base + "/" + _dir;
    var list = fs.readdirSync(_path);
    for(var i=0;i<list.length;i++) {
        var file = list[i];

        if(file[0] !== ".") {
            if(fs.lstatSync(_path + "/" + file).isDirectory()) {
                getConfigs(_path, file)
            }
            else {
                var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, _path + "/" + file)).toString());
                if(configTags.length > 0 && configTags.indexOf(config.tag) < 0) {
                    continue;
                }
                if(!config.exclude) {
                    var id = _dir + "/" + file;

                    var jobEnv = "";
                    if(config.jobs.env) {
                        jobEnv = config.jobs.env;
                        delete config.jobs.env;
                    }

                    for(var jobType in config.jobs) {
                        for(var jobId in config.jobs[jobType]) {
                            var newJobId = id + "_" + jobId;
                            if(!jobsArray[jobType]) {
                                jobsArray[jobType] = {};
                            }
                            jobsArray[jobType][newJobId] = config.jobs[jobType][jobId]
                            jobsArray[jobType][newJobId].id = jobId;
                            if(!jobsArray[jobType][newJobId].env && jobEnv) {
                                jobsArray[jobType][newJobId].env = jobEnv;
                            }
                            delete config.jobs[jobType][jobId];
                        }
                    }
                }
            }
        }
    }
}

function includeAfterTagFilter() {

}



function buildConfig(basePath, dir) {
    const target = `${basePath}/${dir}`;
    const list = fs.readdirSync(target);
    list.forEach(file => {
        if(file[0] !== '.') {
            if(fs.lstatSync(`${target}/${file}`).isDirectory()) {
                buildConfig(target, file)
            }
            else {
                const config = require(path.resolve(__dirname, `${target}/${file}`));
                // if(configTags.length > 0 && configTags.indexOf(config.tag) < 0) {
                //     continue;
                // }
                if(!config.exclude) {
                    const id = `${dir}/${file}`;

                    let jobEnv = "";
                    if(config.jobs.env) {
                        jobEnv = config.jobs.env;
                        delete config.jobs.env;
                    }

                    for(var jobType in config.jobs) {
                        for(var jobId in config.jobs[jobType]) {
                            var newJobId = id + "_" + jobId;
                            if(!jobsArray[jobType]) {
                                jobsArray[jobType] = {};
                            }
                            jobsArray[jobType][newJobId] = config.jobs[jobType][jobId];
                            jobsArray[jobType][newJobId].id = jobId;
                            if(!jobsArray[jobType][newJobId].env && jobEnv) {
                                jobsArray[jobType][newJobId].env = jobEnv;
                            }
                            delete config.jobs[jobType][jobId];
                        }
                    }
                }
            }
        }
    });
}

function load(configPath, jobDirPath) {
    buildConfig(configPath, '');
    runJobs(jobDirPath);
}

function runJobs(jobDirPath) {
    for(var jobType in jobsArray) {
        try {
            const jobPath = path.resolve(jobDirPath, jobType.toLowerCase() + ".js");

            var jobClass = require(jobPath);
            var jobGroup = jobsArray[jobType];
            for(var id in jobGroup) {

                if(typeof(jobGroup[id].env) === "undefined") {
                    jobGroup[id].env = "live";
                }
                var job = new jobClass(jobGroup[id]);

                job.start();

            }
        }catch(e) {
            console.log(e);
        }
    }
}



module.exports = {
    load: load
};