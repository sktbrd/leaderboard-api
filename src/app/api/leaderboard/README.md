# Legacy Leaderboard API

## Endpoint
`GET /api/leaderboard`
`POST /api/leaderboard`

## Description
Legacy endpoint for fetching and storing leaderboard data for the Skatehive community. This endpoint triggers data aggregation from Hive and Ethereum blockchains and stores it in the Supabase database.

## Request Examples

### GET Request
```bash
# Basic leaderboard data fetch
curl -X GET "http://localhost:3000/api/leaderboard"

# With community filter
curl -X GET "http://localhost:3000/api/leaderboard?community=skatehive"
```

### POST Request
```bash
# Trigger data update for specific community
curl -X POST "http://localhost:3000/api/leaderboard" \
  -H "Content-Type: application/json" \
  -d '{"community": "skatehive"}'
```

## Query Parameters (GET)
- **community** (string, optional): Filter by community name

## Request Body (POST)
```json
{
  "community": "skatehive"
}
```

## Response Format

### Success Response
```json
{
  "message": "Data fetched and stored successfully."
}
```

### Error Response
```json
{
  "error": "Community parameter is missing"
}
```

## Status Codes
- **200 OK**: Data successfully fetched and stored
- **400 Bad Request**: Missing required parameters (POST)
- **500 Internal Server Error**: Data fetch or storage failed

## 🏋️ Skatehive Point System

The legacy leaderboard uses a comprehensive point system to rank users based on their support and contributions to the Skatehive community.

### **Point Categories**
| **Category**              | **Points**                                                              |
| ------------------------- | ----------------------------------------------------------------------- |
| **Hive Balance**          | 0.1 points per Hive, capped at 1,000 Hive (max 100 points)              |
| **Hive Power (HP)**       | 0.5 points per HP, capped at 12,000 HP (max 6,000 points)               |
| **Gnars Votes**           | 30 points per Gnars Vote                                                |
| **Skatehive NFTs**        | 50 points per Skatehive NFT                                             |
| **Witness Vote**          | 1000 points for voting for the Skatehive witness                        |
| **HBD Savings**           | 0.2 points per HBD in savings, capped at 1,000 HBD (max 200 points)     |
| **Number of Posts**       | 0.1 points per post, capped at 3,000 posts (max 300 points)             |
| **Voting Power**          | 1000 points per USD of voting power                                     |
| **Giveth Donations**      | 5 points per USD donated, capped at 1,000 USD (max 5,000 points)        |
| **Last Post Activity**    | 0 points deducted if last post within 7 days, up to 100 points deducted |
| **Ethereum Wallet Bonus** | 5000 points for having a valid Ethereum wallet                          |

### **Total Points Formula**

```
Total Points =
(Capped Hive Points) +
(Capped HP Points) +
(Gnars Votes Points) +
(Skatehive NFT Points) +
(Witness Vote Points) +
(Capped HBD Savings Points) +
(Capped Post Points) +
(Voting Power Points) -
(Inactivity Penalty) +
(Ethereum Wallet Bonus)
```

### **Benefits of the Point System**

- **Recognition**: Reward top contributors and active community members
- **Engagement**: Encourage active participation across multiple platforms
- **Transparency**: Users can see exactly how their contributions are valued
- **Multi-chain Integration**: Rewards both Hive and Ethereum participation
- **Community Building**: Incentivizes witness voting and community support

## Data Sources

### Hive Blockchain Data
- **HAFSQL Database**: Primary source for Hive user data and activities
- **Post History**: Content creation and engagement metrics
- **Voting Records**: Witness votes and content curation
- **Wallet Balances**: HIVE, HBD, and HP balances

### Ethereum Integration  
- **Gnars DAO**: Voting participation and governance activity
- **NFT Collections**: Skatehive and related NFT holdings
- **Donation Tracking**: Giveth platform contributions
- **Wallet Validation**: Ethereum address verification

### Performance Considerations
- **Caching**: Leaderboard data cached for performance
- **Batch Processing**: Regular updates via cron jobs
- **Rate Limiting**: API limits prevent abuse
- **Data Validation**: Multiple sources cross-referenced

## Integration with Main API

This legacy leaderboard endpoint is part of the broader [Skatehive API](../../../README.md) ecosystem. For modern applications, consider using the V2 leaderboard endpoint at `/api/v2/leaderboard` which provides enhanced features and better performance.

### Migration Path
- **V1 Legacy**: Current endpoint for backward compatibility
- **V2 Modern**: Enhanced leaderboard with additional features
- **Future Updates**: New scoring algorithms and community features

By fostering a supportive and engaged community through transparent ranking and recognition, the Skatehive leaderboard helps make the skateboarding community stronger and more vibrant!
| **Ethereum Wallet Bonus** | 5000 points for having a valid Ethereum wallet                          |

### **Total Points Formula**

```
Total Points =
(Capped Hive Points) +
(Capped HP Points) +
(Gnars Votes Points) +
(Skatehive NFT Points) +
(Witness Vote Points) +
(Capped HBD Savings Points) +
(Capped Post Points) +
(Voting Power Points) -
(Inactivity Penalty) +
(Ethereum Wallet Bonus)
```

### **Point System Benefits**

- **Recognition**: Reward top contributors to the community
- **Engagement**: Encourage active participation and posting
- **Transparency**: Clear formula for how contributions are valued
- **Multi-chain**: Includes both Hive and Ethereum contributions
- **Activity Incentive**: Rewards recent posting activity

## Database Schema

The leaderboard data is stored in Supabase with the following schema:

```sql
create table public.leaderboard (
  id serial not null,
  hive_author text not null,
  hive_balance double precision null,
  hp_balance double precision null,
  hbd_balance double precision null,
  hbd_savings_balance double precision null,
  has_voted_in_witness boolean null,
  eth_address character varying null,
  gnars_balance double precision null,
  gnars_votes double precision null,
  skatehive_nft_balance double precision null,
  max_voting_power_usd double precision null,
  last_updated timestamp without time zone null,
  last_post timestamp without time zone null,
  post_count integer null,
  points double precision null,
  giveth_donations_usd numeric null default 0,
  giveth_donations_amount numeric null default 0,
  constraint leaderboard_pkey primary key (id),
  constraint leaderboard_hive_author_key unique (hive_author)
) TABLESPACE pg_default;
```

## Data Processing

### Data Sources
- **Hive Blockchain**: User balances, posts, voting activity
- **Ethereum**: Token balances, NFTs, donation history
- **Witness Data**: Skatehive witness voting status
- **Giveth**: Donation tracking and amounts

### Processing Steps
1. **Fetch Hive Data**: Retrieve user balances and activity
2. **Fetch Ethereum Data**: Get token balances and NFT holdings
3. **Calculate Points**: Apply the point system formula
4. **Store Results**: Update Supabase database
5. **Generate Rankings**: Order by total points

### Caching and Performance
- **Batch Processing**: Handles multiple users efficiently
- **Error Handling**: Continues processing if individual users fail
- **Logging**: Comprehensive logging for debugging
- **Incremental Updates**: Updates only changed data when possible

## Migration Notice

⚠️ **Legacy Endpoint**: This is a legacy endpoint maintained for backward compatibility.

### Recommended Migration
For new integrations, use the modern V2 leaderboard endpoint:
- **V2 Endpoint**: `/api/v2/leaderboard`
- **Enhanced Features**: Better caching, pagination, filtering
- **Improved Performance**: Optimized queries and response times
- **Extended Data**: Additional metrics and user information

### V2 Advantages
- **Real-time Updates**: More frequent data updates
- **Better Error Handling**: Detailed error responses
- **Pagination Support**: Handle large datasets efficiently  
- **Advanced Filtering**: Sort and filter by multiple criteria
- **Enhanced Security**: Improved rate limiting and validation

## Environment Variables

Required environment variables for the leaderboard:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Hive Blockchain
HIVE_API_URL=https://api.hive.blog
HAFSQL_HOST=your-hafsql-host
HAFSQL_PORT=5432
HAFSQL_DATABASE=your-database
HAFSQL_USERNAME=your-username
HAFSQL_PASSWORD=your-password

# Ethereum
ETHEREUM_RPC_URL=your-ethereum-rpc-url
ALCHEMY_API_KEY=your-alchemy-api-key

# Giveth Integration
GIVETH_API_URL=https://mainnet.serve.giveth.io/graphql
```

## Rate Limiting

- **GET Requests**: 60 requests per hour per IP
- **POST Requests**: 10 requests per hour per IP
- **Data Processing**: Can take 30-60 seconds per request
- **Concurrent Requests**: Limited to prevent database overload

## Use Cases

### Data Refresh
- **Manual Updates**: Trigger via POST request
- **Scheduled Updates**: Use with cron jobs
- **Community Events**: Update after major community activities

### Integration
- **Frontend Display**: Fetch data for leaderboard UI
- **Analytics**: Track community growth and engagement
- **Rewards**: Base for token distribution or privileges
- **Monitoring**: Check data freshness and accuracy

## Support and Troubleshooting

### Common Issues
- **Timeout Errors**: Data processing can take time, increase timeout limits
- **Database Conflicts**: Ensure unique usernames and proper schema
- **API Rate Limits**: Space out requests to avoid hitting limits
- **Missing Data**: Some users may not have all data sources

### Debugging
- Check server logs for detailed error information
- Verify environment variables are properly set
- Ensure database connectivity and schema is correct
- Test individual data sources (Hive, Ethereum, Giveth) separately

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **API Documentation**: Check `/docs` for interactive testing
- **Community Support**: Skatehive Discord and community channels
