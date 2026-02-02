/**
 * Backtest Template Generator
 * Generates Python code skeletons for different strategy types
 * Links to existing project patterns in Nat_Gas, portfolio_var_analysis, unemployment_alpha_model
 */

const BACKTEST_TEMPLATES = {
    macro: {
        name: 'Macro Signal Strategy',
        description: 'Signal-based allocation using economic indicators',
        project: 'unemployment_alpha_model',
        projectPath: '../unemployment_alpha_model/',
        dependencies: ['pandas', 'numpy', 'yfinance', 'fredapi'],
        generate: (config) => `"""
${config.title}
================================================================================
Generated from research idea on ${new Date().toISOString().split('T')[0]}
Template: Macro Signal Strategy (unemployment_alpha_model pattern)

Data Source: ${config.dataSource}
Date Range: ${config.startDate} to ${config.endDate}
Linked Project: unemployment_alpha_model

Original Article: ${config.link || 'N/A'}
================================================================================
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# =====================================================
# Configuration
# =====================================================

CONFIG = {
    'start_date': '${config.startDate}',
    'end_date': '${config.endDate}',
    'initial_capital': 100000,
    'transaction_cost_bps': 5,
    'rebalance_freq': 'M',  # Monthly rebalancing

    # Strategy Parameters (tune these)
    'signal_threshold': 0.02,  # 2% threshold for signal generation
    'max_position': 1.0,       # Maximum position size
}

# =====================================================
# Data Fetching
# =====================================================

def fetch_data():
    """
    Fetch required data for backtest.

    TODO: Customize data sources based on your research idea:
    - FRED: Use fredapi for economic indicators
    - yfinance: Use for equity/ETF data
    - CSV: Load local data files
    """
${config.dataSource === 'fred' ? `    from fredapi import Fred

    # Get your free API key from: https://fred.stlouisfed.org/docs/api/api_key.html
    FRED_API_KEY = 'YOUR_API_KEY_HERE'
    fred = Fred(api_key=FRED_API_KEY)

    # Example economic indicators (customize based on your research):
    # UNRATE - Unemployment Rate
    # ICSA - Initial Claims
    # PAYEMS - Nonfarm Payrolls
    # CPIAUCSL - CPI
    # FEDFUNDS - Federal Funds Rate
    # T10Y2Y - 10Y-2Y Spread

    indicators = {
        'unrate': fred.get_series('UNRATE', CONFIG['start_date'], CONFIG['end_date']),
        # Add more indicators here
    }

    # Combine into DataFrame
    data = pd.DataFrame(indicators)
    data.index = pd.to_datetime(data.index)

    # Get price data for trading
    import yfinance as yf
    prices = yf.download(['SPY', 'TLT'], start=CONFIG['start_date'], end=CONFIG['end_date'])['Adj Close']

    return data, prices` : config.dataSource === 'yfinance' ? `    import yfinance as yf

    # Define tickers based on your research idea
    tickers = ['SPY', 'TLT', 'GLD', 'VIX']  # Customize this

    # Download price data
    prices = yf.download(tickers, start=CONFIG['start_date'], end=CONFIG['end_date'])['Adj Close']

    # Calculate additional features
    data = pd.DataFrame(index=prices.index)
    data['spy_returns'] = prices['SPY'].pct_change()
    data['spy_volatility'] = data['spy_returns'].rolling(20).std() * np.sqrt(252)

    return data, prices` : `    # Load from local CSV
    # Adjust the path to your data file
    data = pd.read_csv('your_data.csv', index_col=0, parse_dates=True)

    # Load price data
    import yfinance as yf
    prices = yf.download(['SPY', 'TLT'], start=CONFIG['start_date'], end=CONFIG['end_date'])['Adj Close']

    return data, prices`}


# =====================================================
# Signal Generation
# =====================================================

def generate_signals(data, prices):
    """
    Generate trading signals based on your research hypothesis.

    TODO: Implement your signal logic here based on the research idea:
    "${config.title}"

    Returns:
    --------
    pd.DataFrame with columns:
        - signal: Raw signal value
        - spy_weight: Allocation to equities (0-1)
        - tlt_weight: Allocation to bonds (0-1)
    """
    signals = pd.DataFrame(index=prices.index)

    # ========== IMPLEMENT YOUR SIGNAL LOGIC HERE ==========
    # Example: Simple momentum signal
    # signals['momentum'] = prices['SPY'].pct_change(20)
    # signals['signal'] = signals['momentum']

    # Example: Mean reversion
    # signals['ma_50'] = prices['SPY'].rolling(50).mean()
    # signals['signal'] = (prices['SPY'] - signals['ma_50']) / signals['ma_50']

    # Placeholder - replace with your logic
    signals['signal'] = 0

    # ========== END SIGNAL LOGIC ==========

    # Convert signal to weights
    signals['spy_weight'] = 0.6  # Default allocation
    signals['tlt_weight'] = 0.4

    # Dynamic allocation based on signal
    # signals.loc[signals['signal'] > CONFIG['signal_threshold'], 'spy_weight'] = 0.8
    # signals.loc[signals['signal'] > CONFIG['signal_threshold'], 'tlt_weight'] = 0.2
    # signals.loc[signals['signal'] < -CONFIG['signal_threshold'], 'spy_weight'] = 0.3
    # signals.loc[signals['signal'] < -CONFIG['signal_threshold'], 'tlt_weight'] = 0.7

    return signals


# =====================================================
# Backtest Engine
# =====================================================

class BacktestEngine:
    """
    Portfolio simulation engine based on unemployment_alpha_model pattern.
    Handles position sizing, transaction costs, and performance tracking.
    """

    def __init__(self, initial_capital=100000, transaction_cost_bps=5):
        self.initial_capital = initial_capital
        self.transaction_cost = transaction_cost_bps / 10000

    def run(self, prices, signals):
        """Run backtest simulation."""
        # Align data
        common_idx = prices.index.intersection(signals.index)
        prices = prices.loc[common_idx]
        signals = signals.loc[common_idx]

        # Calculate returns
        returns = prices.pct_change()

        # Portfolio tracking
        portfolio = pd.DataFrame(index=common_idx)
        portfolio['spy_weight'] = signals['spy_weight'].shift(1)  # Use prior signal
        portfolio['tlt_weight'] = signals['tlt_weight'].shift(1)

        # Fill NaN weights
        portfolio['spy_weight'] = portfolio['spy_weight'].fillna(0.5)
        portfolio['tlt_weight'] = portfolio['tlt_weight'].fillna(0.5)

        # Calculate portfolio returns
        portfolio['return'] = (
            portfolio['spy_weight'] * returns['SPY'] +
            portfolio['tlt_weight'] * returns['TLT']
        )

        # Apply transaction costs on rebalance days
        weight_changes = np.abs(portfolio['spy_weight'].diff()) + np.abs(portfolio['tlt_weight'].diff())
        portfolio['return'] -= weight_changes * self.transaction_cost

        # Calculate cumulative performance
        portfolio['cumulative'] = (1 + portfolio['return']).cumprod()
        portfolio['value'] = self.initial_capital * portfolio['cumulative']

        return portfolio

    def calculate_metrics(self, portfolio):
        """Calculate comprehensive performance metrics."""
        returns = portfolio['return'].dropna()

        # Basic metrics
        total_return = (portfolio['value'].iloc[-1] / self.initial_capital - 1) * 100
        annual_return = (1 + total_return/100) ** (252 / len(returns)) - 1

        # Risk metrics
        volatility = returns.std() * np.sqrt(252)
        sharpe = (returns.mean() * 252) / (returns.std() * np.sqrt(252)) if returns.std() > 0 else 0

        # Sortino ratio
        downside = returns[returns < 0]
        sortino = (returns.mean() * 252) / (downside.std() * np.sqrt(252)) if len(downside) > 0 else 0

        # Drawdown
        cummax = portfolio['value'].cummax()
        drawdown = (portfolio['value'] - cummax) / cummax
        max_drawdown = drawdown.min() * 100

        # Win rate
        win_rate = (returns > 0).sum() / len(returns) * 100

        metrics = {
            'Total Return (%)': round(total_return, 2),
            'Annual Return (%)': round(annual_return * 100, 2),
            'Volatility (%)': round(volatility * 100, 2),
            'Sharpe Ratio': round(sharpe, 3),
            'Sortino Ratio': round(sortino, 3),
            'Max Drawdown (%)': round(max_drawdown, 2),
            'Win Rate (%)': round(win_rate, 2),
            'Num Trades': int(len(returns))
        }

        return metrics


# =====================================================
# Visualization
# =====================================================

def plot_results(portfolio, metrics):
    """Generate performance visualizations."""
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # Portfolio Value
    ax1 = axes[0, 0]
    ax1.plot(portfolio['value'], label='Strategy', color='#58a6ff')
    ax1.set_title('Portfolio Value Over Time')
    ax1.set_ylabel('Value ($)')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Drawdown
    ax2 = axes[0, 1]
    cummax = portfolio['value'].cummax()
    drawdown = (portfolio['value'] - cummax) / cummax * 100
    ax2.fill_between(drawdown.index, drawdown, 0, alpha=0.5, color='#f85149')
    ax2.set_title('Drawdown')
    ax2.set_ylabel('Drawdown (%)')
    ax2.grid(True, alpha=0.3)

    # Monthly Returns
    ax3 = axes[1, 0]
    monthly = portfolio['return'].resample('M').sum() * 100
    colors = ['#3fb950' if r > 0 else '#f85149' for r in monthly]
    ax3.bar(monthly.index, monthly, color=colors, width=20)
    ax3.set_title('Monthly Returns')
    ax3.set_ylabel('Return (%)')
    ax3.grid(True, alpha=0.3)

    # Metrics Table
    ax4 = axes[1, 1]
    ax4.axis('off')
    metrics_text = '\\n'.join([f'{k}: {v}' for k, v in metrics.items()])
    ax4.text(0.1, 0.5, metrics_text, fontsize=12, family='monospace',
             verticalalignment='center', transform=ax4.transAxes)
    ax4.set_title('Performance Metrics')

    plt.tight_layout()
    plt.savefig('backtest_results.png', dpi=150, bbox_inches='tight')
    plt.show()

    print("\\nChart saved to: backtest_results.png")


# =====================================================
# Main Execution
# =====================================================

if __name__ == '__main__':
    print("=" * 70)
    print(f"BACKTEST: {CONFIG.get('title', '${config.title}')}")
    print("=" * 70)

    # 1. Fetch data
    print("\\n[1/4] Fetching data...")
    try:
        data, prices = fetch_data()
        print(f"  - Loaded {len(data)} data observations")
        print(f"  - Price data: {list(prices.columns)}")
        print(f"  - Date range: {prices.index[0].date()} to {prices.index[-1].date()}")
    except Exception as e:
        print(f"  ERROR: {e}")
        print("  Please implement the fetch_data() function for your data source")
        exit(1)

    # 2. Generate signals
    print("\\n[2/4] Generating signals...")
    signals = generate_signals(data, prices)
    print(f"  - Generated {len(signals)} signal periods")

    # 3. Run backtest
    print("\\n[3/4] Running backtest...")
    engine = BacktestEngine(
        initial_capital=CONFIG['initial_capital'],
        transaction_cost_bps=CONFIG['transaction_cost_bps']
    )
    portfolio = engine.run(prices, signals)
    metrics = engine.calculate_metrics(portfolio)

    # 4. Print results
    print("\\n[4/4] Results")
    print("=" * 70)
    for metric, value in metrics.items():
        print(f"  {metric:.<30} {value}")
    print("=" * 70)

    # 5. Plot results
    try:
        plot_results(portfolio, metrics)
    except Exception as e:
        print(f"\\nNote: Could not generate plots ({e})")
        print("Install matplotlib: pip install matplotlib")

    # 6. Save results
    results_file = 'backtest_results.csv'
    portfolio.to_csv(results_file)
    print(f"\\nResults saved to: {results_file}")
`
    },

    commodity: {
        name: 'Commodity Strategy',
        description: 'Walk-forward backtest for commodity trading',
        project: 'Nat_Gas',
        projectPath: '../Nat_Gas/',
        dependencies: ['pandas', 'numpy', 'sklearn'],
        generate: (config) => `"""
${config.title}
================================================================================
Generated from research idea on ${new Date().toISOString().split('T')[0]}
Template: Commodity Strategy (Nat_Gas walk-forward pattern)

Data Source: ${config.dataSource}
Date Range: ${config.startDate} to ${config.endDate}
Linked Project: Nat_Gas

Original Article: ${config.link || 'N/A'}
================================================================================
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings('ignore')

# =====================================================
# Configuration
# =====================================================

CONFIG = {
    'start_date': '${config.startDate}',
    'end_date': '${config.endDate}',
    'initial_capital': 100000,
    'transaction_cost_bps': 10,

    # Walk-forward parameters
    'training_window': 252 * 3,  # 3 years training
    'signal_threshold': 0.02,    # 2% threshold for signals
}

# =====================================================
# Data Fetching
# =====================================================

def fetch_data():
    """Fetch commodity and related data."""
${config.dataSource === 'yfinance' ? `    import yfinance as yf

    # Example commodity ETFs/futures
    tickers = ['USO', 'UNG', 'GLD', 'SLV', 'DBA']  # Customize

    prices = yf.download(tickers, start=CONFIG['start_date'], end=CONFIG['end_date'])['Adj Close']

    # Calculate features
    data = pd.DataFrame(index=prices.index)
    for ticker in tickers:
        data[f'{ticker}_return'] = prices[ticker].pct_change()
        data[f'{ticker}_vol'] = data[f'{ticker}_return'].rolling(20).std()

    return data, prices` : `    # Load from CSV
    data = pd.read_csv('commodity_data.csv', index_col=0, parse_dates=True)
    prices = pd.read_csv('commodity_prices.csv', index_col=0, parse_dates=True)
    return data, prices`}


# =====================================================
# Walk-Forward Backtest
# =====================================================

class WalkForwardBacktest:
    """
    Walk-forward backtesting engine based on Nat_Gas pattern.
    Uses expanding window to avoid look-ahead bias.
    """

    def __init__(self, training_window=756):
        self.training_window = training_window
        self.model = LinearRegression()

    def run(self, data, prices, target_col='USO'):
        """Run walk-forward backtest."""
        results = []

        # Feature columns (exclude target returns)
        feature_cols = [c for c in data.columns if target_col not in c and '_return' not in c]

        for i in range(self.training_window, len(data)):
            # Training data (expanding window)
            train_data = data.iloc[:i]

            # Prepare features and target
            X_train = train_data[feature_cols].dropna()
            y_train = prices[target_col].pct_change().shift(-1).loc[X_train.index].dropna()

            # Align indices
            common_idx = X_train.index.intersection(y_train.index)
            X_train = X_train.loc[common_idx]
            y_train = y_train.loc[common_idx]

            if len(X_train) < 100:
                continue

            # Fit model
            self.model.fit(X_train, y_train)

            # Predict next period
            X_test = data[feature_cols].iloc[i:i+1]
            if X_test.isna().any().any():
                continue

            prediction = self.model.predict(X_test)[0]
            actual = prices[target_col].pct_change().iloc[i] if i < len(prices) - 1 else 0

            # Generate signal
            signal = 1 if prediction > CONFIG['signal_threshold'] else (
                -1 if prediction < -CONFIG['signal_threshold'] else 0
            )

            results.append({
                'date': data.index[i],
                'prediction': prediction,
                'actual': actual,
                'signal': signal,
                'return': signal * actual
            })

        return pd.DataFrame(results).set_index('date')

    def calculate_metrics(self, results):
        """Calculate performance metrics."""
        returns = results['return']

        metrics = {
            'Total Return (%)': round((1 + returns).prod() - 1, 4) * 100,
            'Sharpe Ratio': round(returns.mean() / returns.std() * np.sqrt(252), 3) if returns.std() > 0 else 0,
            'Max Drawdown (%)': round(self._max_drawdown(returns) * 100, 2),
            'Win Rate (%)': round((returns > 0).sum() / (returns != 0).sum() * 100, 2) if (returns != 0).sum() > 0 else 0,
            'Num Trades': int((results['signal'] != 0).sum()),
            'Hit Rate (%)': round((results['prediction'] * results['actual'] > 0).mean() * 100, 2)
        }

        return metrics

    def _max_drawdown(self, returns):
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.cummax()
        drawdown = (cumulative - running_max) / running_max
        return drawdown.min()


# =====================================================
# Main Execution
# =====================================================

if __name__ == '__main__':
    print("=" * 70)
    print(f"WALK-FORWARD BACKTEST: ${config.title}")
    print("=" * 70)

    # Fetch data
    print("\\n[1/3] Fetching data...")
    data, prices = fetch_data()
    print(f"  Loaded {len(data)} observations")

    # Run backtest
    print("\\n[2/3] Running walk-forward backtest...")
    backtest = WalkForwardBacktest(training_window=CONFIG['training_window'])
    results = backtest.run(data, prices)
    metrics = backtest.calculate_metrics(results)

    # Results
    print("\\n[3/3] Results")
    print("=" * 70)
    for metric, value in metrics.items():
        print(f"  {metric:.<30} {value}")
    print("=" * 70)

    results.to_csv('walkforward_results.csv')
    print("\\nResults saved to: walkforward_results.csv")
`
    },

    risk: {
        name: 'Risk Analysis / VaR',
        description: 'Value-at-Risk validation and stress testing',
        project: 'portfolio_var_analysis',
        projectPath: '../portfolio_var_analysis/',
        dependencies: ['pandas', 'numpy', 'scipy'],
        generate: (config) => `"""
${config.title}
================================================================================
Generated from research idea on ${new Date().toISOString().split('T')[0]}
Template: Risk Analysis / VaR (portfolio_var_analysis pattern)

Data Source: ${config.dataSource}
Date Range: ${config.startDate} to ${config.endDate}
Linked Project: portfolio_var_analysis

Original Article: ${config.link || 'N/A'}
================================================================================
"""

import pandas as pd
import numpy as np
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# =====================================================
# Configuration
# =====================================================

CONFIG = {
    'start_date': '${config.startDate}',
    'end_date': '${config.endDate}',
    'confidence_levels': [0.95, 0.99],
    'var_methods': ['historical', 'parametric', 'monte_carlo'],
    'lookback_window': 252,
    'mc_simulations': 10000,
}

# =====================================================
# Data Fetching
# =====================================================

def fetch_data():
    """Fetch portfolio data."""
${config.dataSource === 'yfinance' ? `    import yfinance as yf

    # Define portfolio tickers
    tickers = ['SPY', 'TLT', 'GLD', 'VNQ']  # Customize
    weights = [0.4, 0.3, 0.2, 0.1]  # Customize

    prices = yf.download(tickers, start=CONFIG['start_date'], end=CONFIG['end_date'])['Adj Close']
    returns = prices.pct_change().dropna()

    # Portfolio returns
    portfolio_returns = (returns * weights).sum(axis=1)

    return returns, portfolio_returns, dict(zip(tickers, weights))` : `    # Load from CSV
    returns = pd.read_csv('portfolio_returns.csv', index_col=0, parse_dates=True)
    weights = {'Asset1': 0.5, 'Asset2': 0.5}  # Customize
    portfolio_returns = (returns * list(weights.values())).sum(axis=1)
    return returns, portfolio_returns, weights`}


# =====================================================
# VaR Calculations
# =====================================================

class VaRCalculator:
    """Value-at-Risk calculator with multiple methods."""

    def __init__(self, confidence_levels=[0.95, 0.99]):
        self.confidence_levels = confidence_levels

    def historical_var(self, returns, confidence):
        """Historical simulation VaR."""
        return np.percentile(returns, (1 - confidence) * 100)

    def parametric_var(self, returns, confidence):
        """Parametric (Normal) VaR."""
        mu = returns.mean()
        sigma = returns.std()
        return stats.norm.ppf(1 - confidence, mu, sigma)

    def monte_carlo_var(self, returns, confidence, n_simulations=10000):
        """Monte Carlo VaR."""
        mu = returns.mean()
        sigma = returns.std()
        simulated = np.random.normal(mu, sigma, n_simulations)
        return np.percentile(simulated, (1 - confidence) * 100)

    def calculate_all(self, returns):
        """Calculate VaR using all methods."""
        results = {}

        for conf in self.confidence_levels:
            results[f'Historical VaR {int(conf*100)}%'] = round(self.historical_var(returns, conf) * 100, 3)
            results[f'Parametric VaR {int(conf*100)}%'] = round(self.parametric_var(returns, conf) * 100, 3)
            results[f'Monte Carlo VaR {int(conf*100)}%'] = round(self.monte_carlo_var(returns, conf) * 100, 3)

        return results


# =====================================================
# VaR Backtesting
# =====================================================

class VaRBacktest:
    """Backtest VaR predictions."""

    def __init__(self, lookback=252):
        self.lookback = lookback
        self.calculator = VaRCalculator()

    def run(self, returns, confidence=0.99):
        """Run VaR backtest."""
        violations = []
        var_predictions = []

        for i in range(self.lookback, len(returns)):
            historical = returns.iloc[i-self.lookback:i]
            var = self.calculator.historical_var(historical, confidence)
            actual = returns.iloc[i]

            var_predictions.append({
                'date': returns.index[i],
                'var': var,
                'actual': actual,
                'violation': actual < var
            })

        results = pd.DataFrame(var_predictions).set_index('date')
        return results

    def kupiec_test(self, results, confidence=0.99):
        """Kupiec proportion of failures test."""
        violations = results['violation'].sum()
        n = len(results)
        expected_p = 1 - confidence
        actual_p = violations / n

        # Log-likelihood ratio
        if violations == 0 or violations == n:
            return {'test_stat': np.nan, 'p_value': np.nan, 'pass': True}

        lr = -2 * (
            np.log((1 - expected_p)**(n - violations) * expected_p**violations) -
            np.log((1 - actual_p)**(n - violations) * actual_p**violations)
        )
        p_value = 1 - stats.chi2.cdf(lr, 1)

        return {
            'Expected Violations': round(expected_p * n, 1),
            'Actual Violations': violations,
            'Violation Rate (%)': round(actual_p * 100, 2),
            'Test Statistic': round(lr, 3),
            'P-Value': round(p_value, 4),
            'Pass': p_value > 0.05
        }


# =====================================================
# Main Execution
# =====================================================

if __name__ == '__main__':
    print("=" * 70)
    print(f"VAR ANALYSIS: ${config.title}")
    print("=" * 70)

    # Fetch data
    print("\\n[1/4] Fetching data...")
    returns, portfolio_returns, weights = fetch_data()
    print(f"  Portfolio weights: {weights}")
    print(f"  Observations: {len(portfolio_returns)}")

    # Calculate VaR
    print("\\n[2/4] Calculating VaR...")
    calculator = VaRCalculator(CONFIG['confidence_levels'])
    var_results = calculator.calculate_all(portfolio_returns)

    print("\\n  VaR Estimates:")
    for method, value in var_results.items():
        print(f"    {method}: {value}%")

    # Backtest VaR
    print("\\n[3/4] Backtesting VaR...")
    backtest = VaRBacktest(CONFIG['lookback_window'])
    bt_results = backtest.run(portfolio_returns)
    kupiec = backtest.kupiec_test(bt_results)

    # Results
    print("\\n[4/4] Backtest Results")
    print("=" * 70)
    for metric, value in kupiec.items():
        print(f"  {metric:.<30} {value}")
    print("=" * 70)

    bt_results.to_csv('var_backtest_results.csv')
    print("\\nResults saved to: var_backtest_results.csv")
`
    },

    factor: {
        name: 'Factor Strategy',
        description: 'Factor timing and allocation strategy',
        project: null,
        projectPath: null,
        dependencies: ['pandas', 'numpy', 'yfinance'],
        generate: (config) => `"""
${config.title}
================================================================================
Generated from research idea on ${new Date().toISOString().split('T')[0]}
Template: Factor Timing Strategy

Data Source: ${config.dataSource}
Date Range: ${config.startDate} to ${config.endDate}

Original Article: ${config.link || 'N/A'}
================================================================================
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# =====================================================
# Configuration
# =====================================================

CONFIG = {
    'start_date': '${config.startDate}',
    'end_date': '${config.endDate}',
    'initial_capital': 100000,

    # Factor ETF proxies
    'factors': {
        'Market': 'SPY',
        'Size': 'IWM',      # Small cap
        'Value': 'IWD',     # Value
        'Growth': 'IWF',    # Growth
        'Momentum': 'MTUM',
        'Quality': 'QUAL',
        'Low Vol': 'USMV',
    },

    'rebalance_freq': 'M',
}

# =====================================================
# Data Fetching
# =====================================================

def fetch_factor_data():
    """Fetch factor ETF data."""
    import yfinance as yf

    tickers = list(CONFIG['factors'].values())
    prices = yf.download(tickers, start=CONFIG['start_date'], end=CONFIG['end_date'])['Adj Close']
    returns = prices.pct_change().dropna()

    # Rename columns to factor names
    factor_names = {v: k for k, v in CONFIG['factors'].items()}
    returns.columns = [factor_names.get(c, c) for c in returns.columns]
    prices.columns = [factor_names.get(c, c) for c in prices.columns]

    return prices, returns


# =====================================================
# Factor Timing Signals
# =====================================================

def generate_factor_signals(returns):
    """
    Generate factor timing signals.

    TODO: Implement your factor timing logic based on:
    "${config.title}"
    """
    signals = pd.DataFrame(index=returns.index)

    # ========== IMPLEMENT YOUR FACTOR TIMING LOGIC ==========

    # Example: Momentum-based factor rotation
    # Look at 12-month minus 1-month returns
    for factor in returns.columns:
        mom_12m = returns[factor].rolling(252).mean()
        mom_1m = returns[factor].rolling(21).mean()
        signals[factor] = mom_12m - mom_1m

    # Rank factors and select top 3
    ranks = signals.rank(axis=1, ascending=False)
    weights = (ranks <= 3).astype(float)
    weights = weights.div(weights.sum(axis=1), axis=0)

    # ========== END TIMING LOGIC ==========

    return weights


# =====================================================
# Backtest
# =====================================================

def run_backtest(returns, weights):
    """Run factor rotation backtest."""
    # Align data
    weights = weights.shift(1)  # Use prior period weights

    # Calculate portfolio returns
    portfolio_returns = (returns * weights).sum(axis=1)

    # Performance metrics
    cumulative = (1 + portfolio_returns).cumprod()

    metrics = {
        'Total Return (%)': round((cumulative.iloc[-1] - 1) * 100, 2),
        'Annual Return (%)': round(portfolio_returns.mean() * 252 * 100, 2),
        'Volatility (%)': round(portfolio_returns.std() * np.sqrt(252) * 100, 2),
        'Sharpe Ratio': round(portfolio_returns.mean() / portfolio_returns.std() * np.sqrt(252), 3),
        'Max Drawdown (%)': round(((cumulative / cumulative.cummax()) - 1).min() * 100, 2),
    }

    return portfolio_returns, metrics


# =====================================================
# Main Execution
# =====================================================

if __name__ == '__main__':
    print("=" * 70)
    print(f"FACTOR STRATEGY: ${config.title}")
    print("=" * 70)

    # Fetch data
    print("\\n[1/3] Fetching factor data...")
    prices, returns = fetch_factor_data()
    print(f"  Factors: {list(returns.columns)}")
    print(f"  Period: {returns.index[0].date()} to {returns.index[-1].date()}")

    # Generate signals
    print("\\n[2/3] Generating factor timing signals...")
    weights = generate_factor_signals(returns)

    # Run backtest
    print("\\n[3/3] Running backtest...")
    portfolio_returns, metrics = run_backtest(returns, weights)

    # Results
    print("\\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)
    for metric, value in metrics.items():
        print(f"  {metric:.<30} {value}")
    print("=" * 70)

    # Save results
    results = pd.DataFrame({
        'portfolio_return': portfolio_returns,
        'cumulative': (1 + portfolio_returns).cumprod()
    })
    results.to_csv('factor_strategy_results.csv')
    print("\\nResults saved to: factor_strategy_results.csv")
`
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.BACKTEST_TEMPLATES = BACKTEST_TEMPLATES;
}
