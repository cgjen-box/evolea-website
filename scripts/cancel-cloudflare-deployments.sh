#!/bin/bash

# Bulk Cancel/Delete Cloudflare Pages Deployments
# Usage: ./cancel-cloudflare-deployments.sh

# === CONFIGURATION - FILL THESE IN ===
ACCOUNT_ID="${CF_ACCOUNT_ID:-YOUR_ACCOUNT_ID_HERE}"
API_TOKEN="${CF_API_TOKEN:-YOUR_API_TOKEN_HERE}"
PROJECT_NAME="evolea-website"

# === OPTIONS ===
# Set to "true" to only delete in-progress/queued builds, "false" to delete ALL deployments
ONLY_IN_PROGRESS="false"
# Number of parallel delete requests (be careful not to hit rate limits)
PARALLEL_JOBS=10
# Delay between batches (seconds)
BATCH_DELAY=1

# === COLORS ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Cloudflare Pages Bulk Deployment Cancellation ===${NC}"
echo "Project: $PROJECT_NAME"
echo ""

# Check if credentials are set
if [[ "$ACCOUNT_ID" == "YOUR_ACCOUNT_ID_HERE" ]] || [[ "$API_TOKEN" == "YOUR_API_TOKEN_HERE" ]]; then
    echo -e "${RED}ERROR: Please set your credentials!${NC}"
    echo ""
    echo "Option 1: Edit this script and fill in ACCOUNT_ID and API_TOKEN"
    echo ""
    echo "Option 2: Set environment variables:"
    echo "  export CF_ACCOUNT_ID='your-account-id'"
    echo "  export CF_API_TOKEN='your-api-token'"
    echo ""
    echo "Find your Account ID: Cloudflare Dashboard → Pages → evolea-website → Settings"
    echo "Create API Token: Dashboard → My Profile → API Tokens (needs 'Cloudflare Pages:Edit')"
    exit 1
fi

# Function to get all deployment IDs
get_deployments() {
    local page=1
    local per_page=100
    local all_ids=()

    echo -e "${YELLOW}Fetching deployments...${NC}"

    while true; do
        response=$(curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments?page=$page&per_page=$per_page" \
            -H "Authorization: Bearer $API_TOKEN")

        # Check for errors
        success=$(echo "$response" | jq -r '.success')
        if [[ "$success" != "true" ]]; then
            echo -e "${RED}API Error:${NC}"
            echo "$response" | jq '.errors'
            exit 1
        fi

        # Extract deployment IDs (optionally filter by status)
        if [[ "$ONLY_IN_PROGRESS" == "true" ]]; then
            ids=$(echo "$response" | jq -r '.result[] | select(.latest_stage.status == "active" or .latest_stage.status == "idle" or .latest_stage.status == "queued") | .id')
        else
            ids=$(echo "$response" | jq -r '.result[].id')
        fi

        # Check if we got any results
        count=$(echo "$response" | jq '.result | length')
        if [[ "$count" -eq 0 ]]; then
            break
        fi

        # Add to our list
        while IFS= read -r id; do
            if [[ -n "$id" ]]; then
                all_ids+=("$id")
            fi
        done <<< "$ids"

        echo "  Page $page: Found $count deployments (total collected: ${#all_ids[@]})"

        # Check if there are more pages
        if [[ "$count" -lt "$per_page" ]]; then
            break
        fi

        ((page++))
        sleep 0.5  # Small delay to avoid rate limits
    done

    printf '%s\n' "${all_ids[@]}"
}

# Function to delete a single deployment
delete_deployment() {
    local id=$1
    local response=$(curl -s -X DELETE \
        "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$id?force=true" \
        -H "Authorization: Bearer $API_TOKEN")

    local success=$(echo "$response" | jq -r '.success')
    if [[ "$success" == "true" ]]; then
        echo -e "${GREEN}✓${NC} Deleted: $id"
    else
        local error=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
        echo -e "${RED}✗${NC} Failed: $id - $error"
    fi
}

export -f delete_deployment
export ACCOUNT_ID API_TOKEN PROJECT_NAME RED GREEN NC

# Main execution
echo ""
deployments=$(get_deployments)
total=$(echo "$deployments" | grep -c . || echo 0)

if [[ "$total" -eq 0 ]]; then
    echo -e "${GREEN}No deployments to delete!${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Found $total deployments to delete${NC}"
echo ""
read -p "Are you sure you want to delete ALL $total deployments? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${YELLOW}Deleting deployments...${NC}"
echo ""

# Delete in parallel batches
echo "$deployments" | xargs -P $PARALLEL_JOBS -I {} bash -c 'delete_deployment "$@"' _ {}

echo ""
echo -e "${GREEN}=== Done! ===${NC}"
