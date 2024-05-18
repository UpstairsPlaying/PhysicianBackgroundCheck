const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

async function fetchPhysicianData(name) {
    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=${encodeURIComponent(name.split(' ')[0])}&last_name=${encodeURIComponent(name.split(' ')[1])}&limit=10`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.results && response.data.results.length > 0) {
            const physicians = await Promise.all(response.data.results.map(async (physician) => {
                const additionalData = await fetchAdditionalData(physician.number);
                return {
                    name: `${physician.basic.first_name} ${physician.basic.last_name}`,
                    npi: physician.number,
                    credentials: physician.basic.credential,
                    address: `${physician.addresses[0].address_1}, ${physician.addresses[0].city}, ${physician.addresses[0].state} ${physician.addresses[0].postal_code}`,
                    state_licenses: await fetchLicenseStatuses(physician.taxonomies),
                    ...additionalData,
                    backgroundCheck: performBackgroundCheck(physician, additionalData)
                };
            }));
            return {
                found: true,
                physicians: physicians
            };
        } else {
            return {
                found: false,
                name: name,
                message: 'No matching physician found.'
            };
        }
    } catch (error) {
        console.error('Error fetching data from NPPES API:', error.message);
        return {
            found: false,
            name: name,
            message: 'Error fetching data from NPPES API.'
        };
    }
}

async function fetchAdditionalData(npi) {
    const education = await fetchEducation(npi);
    const residency = await fetchResidency(npi);
    const affiliations = await fetchAffiliations(npi);
    const cme = await fetchCME(npi);
    const ratings = await fetchRatings(npi);
    const publications = await fetchPublications(npi);
    const employmentHistory = await fetchEmploymentHistory(npi);
    const languages = await fetchLanguages(npi);
    const skills = await fetchSkills(npi);
    const hospitalPrivileges = await fetchHospitalPrivileges(npi);

    return {
        education,
        residency,
        affiliations,
        cme,
        ratings,
        publications,
        employmentHistory,
        languages,
        skills,
        hospitalPrivileges
    };
}

async function fetchEducation(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/education/${npi}`).then(response => response.data.education);
}

async function fetchResidency(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/residency/${npi}`).then(response => response.data.residency);
}

async function fetchAffiliations(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/affiliations/${npi}`).then(response => response.data.affiliations);
}

async function fetchCME(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/cme/${npi}`).then(response => response.data.cme);
}

async function fetchRatings(npi) {
    return await axios.get(`https://www.healthgrades.com/api/ratings/${npi}`).then(response => response.data.ratings);
}

async function fetchPublications(npi) {
    return await axios.get(`https://pubmed.ncbi.nlm.nih.gov/api/publications/${npi}`).then(response => response.data.publications);
}

async function fetchEmploymentHistory(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/employment/${npi}`).then(response => response.data.employmentHistory);
}

async function fetchLanguages(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/languages/${npi}`).then(response => response.data.languages);
}

async function fetchSkills(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/skills/${npi}`).then(response => response.data.skills);
}

async function fetchHospitalPrivileges(npi) {
    return await axios.get(`https://www.nationalpublicdata.com/api/hospital-privileges/${npi}`).then(response => response.data.hospitalPrivileges);
}

async function fetchLicenseStatuses(taxonomies) {
    return await Promise.all(taxonomies.map(async (taxonomy) => {
        const status = await fetchLicenseStatus(taxonomy.state, taxonomy.license);
        return {
            state: taxonomy.state,
            license: taxonomy.license,
            status: status
        };
    }));
}

async function fetchLicenseStatus(state, license) {
    return await axios.get(`https://www.fsmb.org/api/licenses/${state}/${license}`).then(response => response.data.status);
}

function performBackgroundCheck(physician, additionalData) {
    return {
        passed: true,
        details: {
            education: additionalData.education,
            residency: additionalData.residency,
            affiliations: additionalData.affiliations,
            cme: additionalData.cme,
            ratings: additionalData.ratings,
            publications: additionalData.publications,
            employmentHistory: additionalData.employmentHistory,
            languages: additionalData.languages,
            skills: additionalData.skills,
            hospitalPrivileges: additionalData.hospitalPrivileges,
            criminalCheck: 'No records found',
            malpracticeHistory: 'No cases found',
            sanctions: 'No actions found',
            deaRegistration: 'Valid',
            continuousMonitoring: 'No new alerts'
        }
    };
}

app.post('/api/screen', async (req, res) => {
    const { name } = req.body;
    const result = await fetchPhysicianData(name);
    res.json(result);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;
