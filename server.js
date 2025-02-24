const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const Table = require('cli-table3');
const app = express();
/**
 * @swagger
 * tags:
 *   name: 统计git提交
 *   description: 统计某个时间段内某些用户提交的天数和commit个数
 */

app.use(express.json());

// 获取用户ID
async function getUserId(username, gitlabUrl, token) {
    try {
        const response = await axios.get(`${gitlabUrl}/api/v4/users`, {
            params: { username },
            headers: { 'Private-Token': token }
        });
        return response.data[0]?.id || null;
    } catch (error) {
        console.error(`Error getting user ID for ${username}:`, error.message);
        return null;
    }
}

// 获取提交记录
async function getCommits(userId, startDate, endDate, gitlabUrl, token) {
    let allCommits = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await axios.get(`${gitlabUrl}/api/v4/users/${userId}/events`, {
            headers: { 'Private-Token': token },
            params: {
                action: 'pushed',
                after: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
                before: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
                per_page: 100,
                page: page++
            }
        });
        const commits = response.data;
        if (commits && commits.length) {
            allCommits = allCommits.concat(commits);
            if (commits.length !== 100) {
                hasMore = false;
                break;
            }
        }
        else {
            break
        }
    }
    return allCommits;
}



/**
 * @swagger
 * /api/commits:
 *   get:
 *     summary: 统计git提交
 *     tags: [统计git提交]
 *     parameters:
 *       - in: query
 *         name: gitlabHost
 *         required: true
 *         schema:
 *           type: string
 *         description: gitlab服务器地址
 *       - in: query
 *         name: privateToken
 *         required: true
 *         schema:
 *           type: string
 *         description: gitlab access token
 *       - in: query
 *         name: userIds
 *         required: true
 *         schema:
 *           type: array
 *           items: 
 *             type: string  # 明确数组元素类型
 *         description: 用户id（多个用逗号分隔）
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date  # 添加日期格式
 *         description: 开始时间（格式：YYYY-MM-DD）
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date  # 添加日期格式
 *         description: 结束时间（格式：YYYY-MM-DD）
 *     responses:
 *       200:
 *         description: 成功返回提交统计
 *         content:
 *           application/json:
 *             example:
 *               code: 200
 *               data: []
 */
app.get('/api/commits', async (req, res) => {
    try {
        debugger
        const { gitlabHost, privateToken, userIds, startDate, endDate } = req.query;

        // 验证参数
        if (!gitlabHost || !privateToken || !userIds || !startDate || !endDate) {
            return res.status(400).send('Missing required parameters');
        }

        // 处理日期
        const start = startDate;
        const end = endDate;
        const users = userIds;

        // 处理每个用户
        const results = [];
        for (const user of users) {
            const userId = await getUserId(user, gitlabHost, privateToken);
            if (!userId) {
                results.push({ user, totalDays: 0, totalCommits: 0 });
                continue;
            }

            var commits = await getCommits(userId, start, end, gitlabHost, privateToken);
            commits = commits.filter(c => c.action_name !== 'deleted');
            const dateCounts = new Set();

            commits.forEach(commit => {
                const date = moment(commit.created_at)
                    .tz('Asia/Shanghai')
                    .format('YYYY-MM-DD');
                dateCounts.add(date);
            });

            results.push({
                user,
                totalDays: dateCounts.size,
                totalCommits: commits.length
            });
        }

        // 生成表格
        const table = new Table({
            head: ['Name', 'Total Days', 'Total Commits'],
            colAligns: ['left', 'center', 'center'],
            style: {
                head: [],    // 禁用头部颜色
                border: []   // 禁用边框颜色
            },
            chars: {
                // 使用纯文本字符绘制表格边框
                'top': '-', 'top-mid': '-', 'top-left': '-', 'top-right': '-',
                'bottom': '-', 'bottom-mid': '-', 'bottom-left': '-', 'bottom-right': '-',
                'left': '|', 'left-mid': '|', 'mid': '-', 'mid-mid': '-',
                'right': '|', 'right-mid': '|', 'middle': '|'
            }
        });

        results.forEach(row => table.push([row.user, row.totalDays, row.totalCommits]));

        res.set('Content-Type', 'text/plain');
        res.send(
            `${moment(start).format('YYYY-MM-DD')} ~ ${moment(end).format('YYYY-MM-DD')} GitLab提交统计:\n\n` +
            table.toString()
        );

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

require("./swagger")(app);
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));