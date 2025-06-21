import pool from '../data/db.js';

const POSITIVE_NEWS_TEMPLATES = [
    'Sources say {candidateName} has a secret talent for baking world-class pastries!',
    'A recent poll shows {candidateName} is overwhelmingly popular with household pets.',
    '{candidateName} was spotted single-handedly rescuing a dozen kittens from a tall tree.',
    'Insiders reveal {candidateName} donates half their salary to a charity for sad clowns.',
    'BREAKING: {candidateName} has just published a bestselling book of epic poetry.',
    '{candidateName} reportedly high-fived every voter in their district in one afternoon.',
    'Scientists confirm {candidateName} emits calming frequencies that soothe angry toddlers.',
    '{candidateName} is said to have defeated a chess grandmaster using only a Sudoku puzzle.',
    'Local legend says {candidateName} once watered a dying plant just by speaking to it.',
    'Eyewitnesses say {candidateName} helped a turtle cross the street—backwards—blindfolded.',
    'A Nobel committee accidentally awarded {candidateName} for \'Best Overall Vibes\'.',
    'Street performers claim {candidateName} tipped them with gold-wrapped compliments.',
    '{candidateName} taught a group of pigeons to vote responsibly in a mock election.',
    'Fans say {candidateName} invented a dance that heals sprained ankles.',
    'BREAKING: {candidateName} has been declared an honorary unicorn by fantasy fans.',
    'Survivors say {candidateName} once gave the weather a pep talk—and it stopped raining.',
    'Poll shows 97% of dogs would vote for {candidateName}, if legally allowed.',
    'Children across the country are naming their stuffed animals after {candidateName}.',
    'A bakery named their most delicious cake after {candidateName}—sales tripled overnight.',
    'Residents report that {candidateName} returned everyone\'s lost socks. All of them.'
];

const NEGATIVE_NEWS_TEMPLATES = [
    'Shocking footage shows {candidateName} stealing candy from a baby—and blaming the baby.',
    'Leaked audio reveals {candidateName} ordered pineapple on *every* pizza in Parliament.',
    'Investigation reveals {candidateName} photoshopped themselves into historic events.',
    'Parliament in chaos after {candidateName} tried to replace the anthem with dubstep.',
    '{candidateName} caught red-handed forging diplomas using glitter glue and lies.',
    'Whistleblower claims {candidateName} created traffic jams just to test citizen patience.',
    'BREAKING: {candidateName} was allegedly seen racing shopping carts at 3 AM in a tuxedo.',
    'Citizens horrified as {candidateName} attempts to tax laughter and charge for sneezes.',
    '{candidateName} accused of replacing the national bird with a holographic duck.',
    'Allegedly, {candidateName} declared war on umbrellas after losing a fight in the rain.',
    'Scandal erupts as {candidateName} tries to ban Tuesdays \'for being too emotional\'.',
    '{candidateName} seen signing laws using invisible ink and interpretive dance.',
    'Insiders say {candidateName} speaks fluent Parseltongue—and uses it during debates.',
    'Leaked report: {candidateName} paid actors to attend their own surprise birthday party.',
    'Accusations fly as {candidateName} is caught microwaving cereal \'to feel powerful\'.',
    'Unverified claims say {candidateName} replaced Parliament chairs with whoopee cushions.',
    'Eyewitnesses say {candidateName} challenged gravity to a duel—and lost.',
    'BREAKING: {candidateName} tried to sell national secrets on Etsy under a fake name.',
    'Controversial bill proposed by {candidateName} would ban yawning in public spaces.',
    'Sources confirm {candidateName} believes democracy is a brand of pasta.',
    'Scandal! {candidateName} allegedly believes pineapple belongs on pizza.',
    'Witnesses claim {candidateName} can\'t tell the difference between a cat and a dog.',
    '{candidateName} was heard admitting they still use Internet Explorer.',
    'Leaked documents suggest {candidateName} thinks the Earth is shaped like a donut.',
    'An anonymous source says {candidateName} talks to garden gnomes for political advice.',
    'BREAKING: {candidateName} once confused Parliament with a karaoke bar.',
    '{candidateName} accused of replacing city fountains with bubble tea dispensers.',
    'Shocking: {candidateName} tried to outlaw naps on Sundays.',
    'Controversy erupts as {candidateName} proposes mandatory glitter in public schools.',
    'Outrage grows after {candidateName} said Wi-Fi is a \'passing fad\'.',
    'Critics say {candidateName} refers to every bird as \'Steve\'.',
    'Leaked emails reveal {candidateName} tried to ban left-handed spoons.',
    '{candidateName} seen challenging squirrels to arm wrestling matches.',
    'Report claims {candidateName} thinks avocados are government spies.',
    'Allegations surface that {candidateName} ghostwrote horoscopes while sleepwalking.',
    '{candidateName} insists on speaking only in rhymes during budget meetings.',
    'Survey says 8 out of 10 mirrors refused to reflect {candidateName}.',
    'BREAKING: {candidateName} reportedly invented a new color—just to ban it.',
    'Public outraged as {candidateName} misspelled \'democracy\' in 14 tweets.',
    'Confidential tape reveals {candidateName} tried to bribe traffic lights.'
];

async function generateUniqueFakeNews(voterCnp) {
    const client = await pool.connect();
    try {
        const candidatesResult = await client.query('SELECT name FROM candidates');
        const candidates = candidatesResult.rows;

        if (candidates.length === 0) {
            throw new Error('No candidates available to generate news about.');
        }

        const existingNewsResult = await client.query('SELECT news_text FROM FakeNews WHERE voter_cnp = $1', [voterCnp]);
        const existingNews = existingNewsResult.rows.map(r => r.news_text);

        for (let i = 0; i < 50; i++) { // Limit attempts to prevent infinite loops
            const isPositive = Math.random() > 0.5;
            const templates = isPositive ? POSITIVE_NEWS_TEMPLATES : NEGATIVE_NEWS_TEMPLATES;
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
            const newsText = randomTemplate.replace('{candidateName}', randomCandidate.name);

            if (!existingNews.includes(newsText)) {
                const newNewsResult = await client.query(
                    'INSERT INTO FakeNews (voter_cnp, news_text, is_positive, candidate) VALUES ($1, $2, $3, $4) RETURNING *',
                    [voterCnp, newsText, isPositive, randomCandidate.name]
                );
                return newNewsResult.rows[0];
            }
        }

        throw new Error('Could not generate a unique piece of fake news. Please try again later.');

    } catch (error) {
        console.error('Error in generateUniqueFakeNews:', error);
        throw error;
    } finally {
        client.release();
    }
}

export { generateUniqueFakeNews }; 