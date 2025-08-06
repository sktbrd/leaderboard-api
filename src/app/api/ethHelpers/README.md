# Ethereum Helpers API Endpoint

## Endpoint

`GET /api/ethHelpers`

## Description

Provides Ethereum blockchain utilities including balance checks, voting power, and NFT balance queries for Ethereum addresses associated with Skatehive users.

## Request Format

```bash
curl -X GET "http://localhost:3000/api/ethHelpers?address={eth_address}&method={method_name}"
```

## Parameters

- **address** (query parameter, required): Ethereum wallet address
- **method** (query parameter, required): Method to execute
  - `balance` - Get ETH balance
  - `votes` - Get voting power/governance tokens
  - `skatehiveNFTBalance` - Get Skatehive NFT balance

## Example Requests

### Get ETH Balance

```bash
curl -X GET "http://localhost:3000/api/ethHelpers?address=0x41CB654D1F47913ACAB158a8199191D160DAbe4A&method=balance"
```

### Get Voting Power

```bash
curl -X GET "http://localhost:3000/api/ethHelpers?address=0x41CB654D1F47913ACAB158a8199191D160DAbe4A&method=votes"
```

### Get NFT Balance

```bash
curl -X GET "http://localhost:3000/api/ethHelpers?address=0x41CB654D1F47913ACAB158a8199191D160DAbe4A&method=skatehiveNFTBalance"
```

## Response Format

### Successful Response

Response format varies by method:

#### Balance Method

```json
{
  "success": true,
  "data": {
    "balance": "1.234567890123456789",
    "formatted": "1.23 ETH"
  }
}
```

#### Votes Method

```json
{
  "success": true,
  "data": {
    "votingPower": "1000",
    "delegatedPower": "500"
  }
}
```

#### NFT Balance Method

```json
{
  "success": true,
  "data": {
    "nftBalance": "3",
    "tokenIds": ["1", "42", "100"]
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid parameters" | "Failed to fetch data"
}
```

## Status Codes

- **200 OK**: Successfully executed method
- **400 Bad Request**: Missing or invalid parameters
- **500 Internal Server Error**: Blockchain query failed

## Dependencies

- **Alchemy API**: For Ethereum blockchain queries
- **Web3 Provider**: Ethereum network connection
- **Smart Contracts**: Skatehive NFT contract interface

## Rate Limiting

- Limited by Alchemy API rate limits
- Recommended: Cache results for frequently queried addresses

## Use Cases

- **Wallet Integration**: Display user's ETH balance
- **Governance**: Check voting power for DAO participation
- **NFT Verification**: Verify Skatehive NFT ownership
- **Community Access**: Gate features based on token ownership

## Environment Variables Required

```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

## Error Handling

- Invalid address format returns 400 error
- Network issues return 500 error
- Unsupported methods return 400 error

## Security Notes

- Public endpoint - no sensitive data exposed
- Address validation prevents injection attacks
- Rate limiting prevents abuse
